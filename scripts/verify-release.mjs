import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

const FULL_COMMIT = /^[0-9a-f]{40}$/i;
const VERSION_TAG = /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function immutableReference(spec) {
  const archiveMatch = spec.match(/\/archive\/(?:refs\/tags\/)?([^/]+?)(?:\.tar\.gz|\.zip)$/);
  if (archiveMatch) return archiveMatch[1];
  const hashIndex = spec.lastIndexOf("#");
  return hashIndex >= 0 ? spec.slice(hashIndex + 1) : undefined;
}

export function verifyRuntimeDependencySpecs(dependencies = {}, lockRoot, lockPackages = {}) {
  const errors = [];
  for (const [name, specValue] of Object.entries(dependencies)) {
    if (typeof specValue !== "string") continue;
    const isGitHubSource = /(?:git\+|github:|github\.com\/)/i.test(specValue);
    if (!isGitHubSource) continue;

    const reference = immutableReference(specValue);
    if (!reference || (!FULL_COMMIT.test(reference) && !VERSION_TAG.test(reference))) {
      errors.push(`runtime dependency ${name} must use an immutable full commit or version tag: ${specValue}`);
      continue;
    }

    const lockSpec = lockRoot?.dependencies?.[name];
    const resolved = lockPackages[`node_modules/${name}`]?.resolved;
    if (lockSpec !== specValue) errors.push(`package-lock.json root spec for ${name} does not match package.json`);
    if (FULL_COMMIT.test(reference) && !resolved?.includes(reference)) {
      errors.push(`package-lock.json resolution for ${name} does not contain expected commit ${reference}`);
    }
  }
  return errors;
}

export function extractReleaseNotes(changelog, requestedTag) {
  const version = requestedTag.replace(/^v/, "");
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`release tag is not valid semver: ${requestedTag}`);
  }
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(`^## ${escapedVersion} - \\d{4}-\\d{2}-\\d{2}$`, "m");
  const match = heading.exec(changelog);
  if (!match) throw new Error(`CHANGELOG.md is missing a dated section for ${version}`);
  const nextSection = changelog.indexOf("\n## ", match.index + match[0].length);
  return changelog.slice(match.index, nextSection < 0 ? undefined : nextSection).trim();
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

  errors.push(...verifyRuntimeDependencySpecs(packageJson.dependencies, lockRoot, packageLock.packages));

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  const tag = `v${packageJson.version}`;
  return {
    name: packageJson.name,
    version: packageJson.version,
    tag,
    notes: extractReleaseNotes(changelog, tag),
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
