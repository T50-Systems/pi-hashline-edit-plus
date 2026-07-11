import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { verifyReleaseMetadata } from "../../scripts/verify-release.mjs";

const temporaryRoots: string[] = [];

async function makeReleaseFixture(overrides?: {
  lockVersion?: string;
  changelog?: string;
}) {
  const root = await mkdtemp(path.join(tmpdir(), "hashline-release-"));
  temporaryRoots.push(root);
  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ name: "example", version: "1.2.3" }),
  );
  await writeFile(
    path.join(root, "package-lock.json"),
    JSON.stringify({
      name: "example",
      version: overrides?.lockVersion ?? "1.2.3",
      packages: {
        "": { name: "example", version: overrides?.lockVersion ?? "1.2.3" },
      },
    }),
  );
  await writeFile(
    path.join(root, "CHANGELOG.md"),
    overrides?.changelog ?? "# Changelog\n\n## [Unreleased]\n\n## 1.2.3 - 2026-07-11\n",
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
    });
  });

  it("reports version drift before release", async () => {
    const root = await makeReleaseFixture({ lockVersion: "1.2.2", changelog: "# Changelog\n" });
    await expect(verifyReleaseMetadata(root, "v1.2.4")).rejects.toThrow(
      /package version 1\.2\.3.*package-lock\.json.*Unreleased.*dated section.*release tag v1\.2\.4/s,
    );
  });
});
