import { readFile, writeFile } from "node:fs/promises";
import { extractReleaseNotes } from "./verify-release.mjs";

const [tag, outputPath = "release-notes.md"] = process.argv.slice(2);
if (!tag) {
  console.error("Usage: node scripts/extract-release-notes.mjs <vX.Y.Z> [output-file]");
  process.exitCode = 1;
} else {
  try {
    const changelog = await readFile(new URL("../CHANGELOG.md", import.meta.url), "utf8");
    const notes = extractReleaseNotes(changelog, tag);
    await writeFile(outputPath, `${notes.trimEnd()}\n`, "utf8");
    console.log(`Release notes for ${tag} written to ${outputPath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
