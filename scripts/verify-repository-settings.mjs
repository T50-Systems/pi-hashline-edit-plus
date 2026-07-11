import { pathToFileURL } from "node:url";

export const requiredChecks = [
  "ci-linux-node22",
  "ci-windows-node22",
  "ci-macos-node22",
];

export function verifyRepositorySettings({ protection, repository, privateReporting }) {
  const errors = [];
  const statusChecks = protection.required_status_checks;
  const configuredChecks = new Set([
    ...(statusChecks?.contexts ?? []),
    ...(statusChecks?.checks ?? []).map((check) => check.context),
  ]);

  if (!statusChecks) errors.push("main has no required status checks");
  if (statusChecks && statusChecks.strict !== true) errors.push("main does not require branches to be current before merge");
  for (const check of requiredChecks) {
    if (!configuredChecks.has(check)) errors.push(`main does not require ${check}`);
  }
  if (protection.allow_force_pushes?.enabled !== false) errors.push("main allows force pushes");
  if (protection.allow_deletions?.enabled !== false) errors.push("main allows deletion");

  const controls = repository.security_and_analysis ?? {};
  if (privateReporting.enabled !== true) errors.push("private vulnerability reporting is disabled");
  if (controls.secret_scanning?.status !== "enabled") errors.push("secret scanning is disabled");
  if (controls.secret_scanning_push_protection?.status !== "enabled") errors.push("secret scanning push protection is disabled");
  if (controls.dependabot_security_updates?.status !== "enabled") errors.push("Dependabot security updates are disabled");

  if (errors.length > 0) throw new Error(errors.join("\n"));
  return { requiredChecks };
}

async function githubJson(path) {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) throw new Error("Set GH_TOKEN or GITHUB_TOKEN to perform read-only GitHub API verification");
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error(`GitHub API ${path} returned ${response.status}`);
  return response.json();
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined;
if (invokedPath === import.meta.url) {
  const repositoryName = process.argv[2] ?? "T50-Systems/pi-hashline-edit-plus";
  try {
    const [repository, protection, privateReporting] = await Promise.all([
      githubJson(`/repos/${repositoryName}`),
      githubJson(`/repos/${repositoryName}/branches/main/protection`),
      githubJson(`/repos/${repositoryName}/private-vulnerability-reporting`),
    ]);
    verifyRepositorySettings({ protection, repository, privateReporting });
    console.log(`Repository controls verified for ${repositoryName}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
