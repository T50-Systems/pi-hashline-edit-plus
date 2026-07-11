import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function verifyReleaseMetadata(root, expectedTag) {
  const packageJson = await readJson(path.join(root, "package.json"));
  const packageLock = await readJson(path.join(root, "package-lock.json"));
  const changelog = await readFile(path.join(root, "CHANGELOG.md"), "utf8");
  const errors = [];
  const lockRoot = packageLock.packages?.[""];

  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(packageJson.version)) {
    errors.push(`package.json version is not valid semver: ${packageJson.version}`);
  }
  if (packageLock.name !== packageJson.name || lockRoot?.name !== packageJson.name) {
    errors.push("package name does not match package-lock.json root metadata");
  }
  if (packageLock.version !== packageJson.version || lockRoot?.version !== packageJson.version) {
    errors.push(
      `package version ${packageJson.version} does not match package-lock.json (${packageLock.version}, ${lockRoot?.version})`,
    );
  }
  if (!/^## \[Unreleased\]$/m.test(changelog)) {
    errors.push("CHANGELOG.md is missing a ## [Unreleased] section");
  }
  const escapedVersion = packageJson.version.replaceAll(".", "\\.");
  if (!new RegExp(`^## ${escapedVersion} - \\d{4}-\\d{2}-\\d{2}$`, "m").test(changelog)) {
    errors.push(`CHANGELOG.md is missing a dated section for ${packageJson.version}`);
  }
  if (expectedTag && expectedTag !== `v${packageJson.version}`) {
    errors.push(`release tag ${expectedTag} does not match package version v${packageJson.version}`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return {
    name: packageJson.name,
    version: packageJson.version,
    tag: `v${packageJson.version}`,
  };
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : undefined;
if (invokedPath === import.meta.url) {
  try {
    const result = await verifyReleaseMetadata(process.cwd(), process.argv[2]);
    console.log(`Release metadata verified: ${result.name} ${result.version} (${result.tag})`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
