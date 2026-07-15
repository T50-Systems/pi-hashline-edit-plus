import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { requiredChecks as repositoryRequiredChecks } from "./verify-repository-settings.mjs";

export const supportedNodeEngine = ">=22";
const expectedRequiredNode22Checks = [
  "ci-linux-node22",
  "ci-windows-node22",
  "ci-macos-node22",
];
export const requiredNode22Checks = [...repositoryRequiredChecks];
export const node24CompatibilityCheck = "ci-linux-node24";

const requiredMatrix = [
  { id: "linux-node22", os: "ubuntu-latest", node: "22" },
  { id: "windows-node22", os: "windows-latest", node: "22" },
  { id: "macos-node22", os: "macos-latest", node: "22" },
  { id: "linux-node24", os: "ubuntu-latest", node: "24" },
];

function matrixEntries(workflow) {
  return [...workflow.matchAll(/- id:\s*(\S+)\s*\r?\n\s+os:\s*(\S+)\s*\r?\n\s+node:\s*([^\s#]+)/g)].map(
    ([, id, os, node]) => ({ id, os, node }),
  );
}

function requireText(errors, documentName, source, pattern, requirement) {
  if (!pattern.test(source)) errors.push(`${documentName} must document ${requirement}`);
}

export function verifyNodeSupportMetadata(metadata) {
  const errors = [];
  const lockRoot = metadata.packageLock.packages?.[""];

  if (metadata.packageJson.engines?.node !== supportedNodeEngine) {
    errors.push(`package.json engines.node must be ${supportedNodeEngine}`);
  }
  if (lockRoot?.engines?.node !== supportedNodeEngine) {
    errors.push(`package-lock.json root engines.node must be ${supportedNodeEngine}`);
  }
  if (lockRoot?.engines?.node !== metadata.packageJson.engines?.node) {
    errors.push("package.json and package-lock.json engines.node must match");
  }
  if (
    requiredNode22Checks.length !== expectedRequiredNode22Checks.length ||
    requiredNode22Checks.some((check, index) => check !== expectedRequiredNode22Checks[index])
  ) {
    errors.push("repository required checks must preserve the three stable Node.js 22 check names");
  }

  const entries = matrixEntries(metadata.ciWorkflow);
  for (const required of requiredMatrix) {
    if (!entries.some((entry) => entry.id === required.id && entry.os === required.os && entry.node === required.node)) {
      errors.push(`ci.yml must include ${required.id} on ${required.os} with Node.js ${required.node}`);
    }
  }
  if (!/name:\s*ci-\$\{\{\s*matrix\.id\s*\}\}/.test(metadata.ciWorkflow)) {
    errors.push("ci.yml must preserve stable ci-${{ matrix.id }} check names");
  }

  requireText(errors, "README.md", metadata.readme, /minimum supported Node\.js version is 22/i, "Node.js 22 as the minimum");
  requireText(errors, "README.md", metadata.readme, /Ubuntu on Node\.js 22 and 24/i, "Ubuntu Node.js 22 and 24 validation");
  requireText(errors, "CONTRIBUTING.md", metadata.contributing, /Node\.js 22 or newer/i, "Node.js 22 or newer for contributors");
  requireText(errors, "CONTRIBUTING.md", metadata.contributing, /Ubuntu also validates Node\.js 24/i, "the Ubuntu Node.js 24 compatibility job");
  requireText(errors, "docs/release-and-stability.md", metadata.releaseStability, /Minimum supported Node\.js.*22/i, "Node.js 22 as the release minimum");
  requireText(errors, "docs/release-and-stability.md", metadata.releaseStability, /Ubuntu latest on Node\.js 24/i, "Ubuntu Node.js 24 compatibility");
  requireText(errors, "docs/repository-controls.md", metadata.repositoryControls, /ci-linux-node24/, "the ci-linux-node24 compatibility check");
  for (const check of requiredNode22Checks) {
    requireText(errors, "docs/repository-controls.md", metadata.repositoryControls, new RegExp(check), `${check} as a stable required check`);
  }
  requireText(errors, "CHANGELOG.md", metadata.changelog, /Raised the declared minimum from Node\.js 20 to the tested Node\.js 22 baseline/i, "the Node.js minimum change");
  requireText(errors, "CHANGELOG.md", metadata.changelog, /Ubuntu Node\.js 24 compatibility coverage/i, "Ubuntu Node.js 24 compatibility coverage");

  if (errors.length > 0) throw new Error(errors.join("\n"));
  return { supportedNodeEngine, requiredNode22Checks, node24CompatibilityCheck };
}

export async function readNodeSupportMetadata(root) {
  const [
    packageSource,
    lockSource,
    ciWorkflow,
    readme,
    contributing,
    releaseStability,
    repositoryControls,
    changelog,
  ] = await Promise.all([
    readFile(path.join(root, "package.json"), "utf8"),
    readFile(path.join(root, "package-lock.json"), "utf8"),
    readFile(path.join(root, ".github", "workflows", "ci.yml"), "utf8"),
    readFile(path.join(root, "README.md"), "utf8"),
    readFile(path.join(root, "CONTRIBUTING.md"), "utf8"),
    readFile(path.join(root, "docs", "release-and-stability.md"), "utf8"),
    readFile(path.join(root, "docs", "repository-controls.md"), "utf8"),
    readFile(path.join(root, "CHANGELOG.md"), "utf8"),
  ]);
  return {
    packageJson: JSON.parse(packageSource),
    packageLock: JSON.parse(lockSource),
    ciWorkflow,
    readme,
    contributing,
    releaseStability,
    repositoryControls,
    changelog,
  };
}

export async function verifyRepositoryNodeSupport(root) {
  return verifyNodeSupportMetadata(await readNodeSupportMetadata(root));
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : undefined;
if (invokedPath === import.meta.url) {
  try {
    const result = await verifyRepositoryNodeSupport(process.cwd());
    console.log(
      `Node support metadata verified: ${result.supportedNodeEngine}, ${requiredNode22Checks.length} required Node 22 checks, ${node24CompatibilityCheck}`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
