import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createLinter } from "actionlint";

const WORKFLOW_EXTENSION = /\.ya?ml$/i;
const USES_LINE = /^\s*(?:-\s*)?uses:\s*(\S+)(?:\s+#\s*(\S.*))?\s*$/;
const FULL_SHA = /^[0-9a-f]{40}$/;
const RELEASE_COMMENT = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function issue(file, line, column, message, kind) {
  return { file, line, column, message, kind };
}

export function validateActionPins(source, filePath) {
  const errors = [];

  for (const [index, line] of source.split(/\r?\n/).entries()) {
    if (!/^\s*(?:-\s*)?uses\s*:/.test(line)) continue;

    const match = USES_LINE.exec(line);
    if (!match) {
      errors.push(issue(filePath, index + 1, 1, "uses must be an unquoted action reference followed by a release comment", "action-pin"));
      continue;
    }

    const reference = match[1];
    const release = match[2];
    if (reference.startsWith("./")) continue;

    const separator = reference.lastIndexOf("@");
    const action = separator < 0 ? reference : reference.slice(0, separator);
    const revision = separator < 0 ? "" : reference.slice(separator + 1);
    if (!/^[^/@\s]+\/[^@\s]+(?:\/[^@\s]+)*$/.test(action)) {
      errors.push(issue(filePath, index + 1, 1, `third-party uses reference is not a GitHub action: ${reference}`, "action-pin"));
      continue;
    }
    if (!FULL_SHA.test(revision)) {
      errors.push(issue(filePath, index + 1, 1, `third-party action ${action} must use a lowercase 40-character commit SHA`, "action-pin"));
    }
    if (!release || !RELEASE_COMMENT.test(release)) {
      errors.push(issue(filePath, index + 1, 1, `third-party action ${action} must end with a release comment such as # v4.2.2`, "action-pin"));
    }
  }

  return errors;
}

export async function discoverWorkflowFiles(root = process.cwd()) {
  const workflowDirectory = path.join(root, ".github", "workflows");
  const entries = await readdir(workflowDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && WORKFLOW_EXTENSION.test(entry.name))
    .map((entry) => path.join(workflowDirectory, entry.name))
    .sort();
}

function lintWorkflow(lint, source, filePath) {
  try {
    return lint(source, filePath.replaceAll("\\", "/"));
  } catch (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error ? String(error.message) : String(error);
    try {
      const parsed = JSON.parse(message);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Preserve unexpected actionlint failures rather than treating them as lint findings.
    }
    throw error;
  }
}

export async function validateWorkflowFiles(filePaths) {
  const lint = await createLinter();
  const errors = [];

  for (const filePath of filePaths) {
    const source = await readFile(filePath, "utf8");
    errors.push(...lintWorkflow(lint, source, filePath));
    errors.push(...validateActionPins(source, filePath));
  }

  return errors;
}

function renderIssue(error) {
  return `${error.file}:${error.line}:${error.column}: ${error.message} [${error.kind}]`;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : undefined;
if (invokedPath === import.meta.url) {
  try {
    const files = process.argv.length > 2 ? process.argv.slice(2).map((file) => path.resolve(file)) : await discoverWorkflowFiles();
    const errors = await validateWorkflowFiles(files);
    if (errors.length > 0) {
      for (const error of errors) console.error(renderIssue(error));
      process.exitCode = 1;
    } else {
      console.log(`Workflow validation passed for ${files.length} file(s).`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
