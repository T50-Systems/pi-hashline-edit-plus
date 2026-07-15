import { describe, expect, it } from "vitest";
import {
  readNodeSupportMetadata,
  verifyNodeSupportMetadata,
  verifyRepositoryNodeSupport,
} from "../../scripts/verify-node-support.mjs";

const root = process.cwd();

describe("Node support metadata", () => {
  it("keeps engines, lockfile, CI, and documentation aligned", async () => {
    await expect(verifyRepositoryNodeSupport(root)).resolves.toEqual({
      supportedNodeEngine: ">=22",
      requiredNode22Checks: [
        "ci-linux-node22",
        "ci-windows-node22",
        "ci-macos-node22",
      ],
      node24CompatibilityCheck: "ci-linux-node24",
    });
  });

  it("reports engine, lockfile, and CI matrix drift together", async () => {
    const metadata = await readNodeSupportMetadata(root);
    metadata.packageJson.engines.node = ">=20";
    metadata.packageLock.packages[""].engines.node = ">=20";
    metadata.ciWorkflow = metadata.ciWorkflow.replace("linux-node24", "linux-node25");

    expect(() => verifyNodeSupportMetadata(metadata)).toThrow(
      /package\.json engines\.node.*package-lock\.json root engines\.node.*ci\.yml must include linux-node24/s,
    );
  });

  it("reports drift in every Node support policy document", async () => {
    const metadata = await readNodeSupportMetadata(root);
    metadata.readme = metadata.readme.replace("minimum supported Node.js version is 22", "minimum is current LTS");
    metadata.contributing = metadata.contributing.replace("Node.js 22 or newer", "Node.js current");
    metadata.releaseStability = metadata.releaseStability.replace("minimum supported Node.js version", "runtime version");
    metadata.repositoryControls = metadata.repositoryControls.replace("ci-linux-node24", "ci-linux-current");
    metadata.changelog = metadata.changelog.replace("Raised the declared minimum", "Adjusted the runtime");

    expect(() => verifyNodeSupportMetadata(metadata)).toThrow(
      /README\.md.*CONTRIBUTING\.md.*docs\/release-and-stability\.md.*docs\/repository-controls\.md.*CHANGELOG\.md/s,
    );
  });
});
