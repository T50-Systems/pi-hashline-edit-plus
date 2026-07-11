import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { extractReleaseNotes, verifyReleaseMetadata } from "../../scripts/verify-release.mjs";

const temporaryRoots: string[] = [];

async function makeReleaseFixture(overrides?: {
  lockVersion?: string;
  changelog?: string;
  dependencySpec?: string;
}) {
  const root = await mkdtemp(path.join(tmpdir(), "hashline-release-"));
  temporaryRoots.push(root);
  const dependencies = overrides?.dependencySpec
    ? { "example-core": overrides.dependencySpec }
    : {};
  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ name: "example", version: "1.2.3", dependencies }),
  );
  await writeFile(
    path.join(root, "package-lock.json"),
    JSON.stringify({
      name: "example",
      version: overrides?.lockVersion ?? "1.2.3",
      packages: {
        "": {
          name: "example",
          version: overrides?.lockVersion ?? "1.2.3",
          dependencies,
        },
        ...(overrides?.dependencySpec
          ? {
              "node_modules/example-core": {
                resolved: overrides.dependencySpec,
              },
            }
          : {}),
      },
    }),
  );
  await writeFile(
    path.join(root, "CHANGELOG.md"),
    overrides?.changelog ??
      "# Changelog\n\n## [Unreleased]\n\nFuture notes.\n\n## 1.2.3 - 2026-07-11\n\n### Fixed\n- Target fix.\n\n## 1.2.2 - 2026-07-01\n\n- Older fix.\n",
  );
  return root;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })));
});

describe("release metadata verification", () => {
  it("accepts aligned package, lockfile, changelog, and tag metadata", async () => {
    const root = await makeReleaseFixture();
    await expect(verifyReleaseMetadata(root, "v1.2.3")).resolves.toEqual({
      name: "example",
      version: "1.2.3",
      tag: "v1.2.3",
      notes: "## 1.2.3 - 2026-07-11\n\n### Fixed\n- Target fix.",
    });
  });

  it("reports version drift before release", async () => {
    const root = await makeReleaseFixture({ lockVersion: "1.2.2", changelog: "# Changelog\n" });
    await expect(verifyReleaseMetadata(root, "v1.2.4")).rejects.toThrow(
      /package version 1\.2\.3.*package-lock\.json.*Unreleased.*dated section.*release tag v1\.2\.4/s,
    );
  });

  it("extracts only the requested release section", () => {
    const changelog = "## 2.0.0 - 2026-07-11\n\nNew.\n\n## 1.0.0 - 2026-01-01\n\nOld.\n";
    expect(extractReleaseNotes(changelog, "v2.0.0")).toBe("## 2.0.0 - 2026-07-11\n\nNew.");
    expect(() => extractReleaseNotes(changelog, "v3.0.0")).toThrow(/missing a dated section/);
  });

  it("rejects an unqualified mutable git runtime dependency", async () => {
    const root = await makeReleaseFixture({
      dependencySpec: "git+https://github.com/example/example-core.git",
    });
    await expect(verifyReleaseMetadata(root)).rejects.toThrow(
      /runtime dependency example-core must use an immutable full commit or version tag/,
    );
  });
});
