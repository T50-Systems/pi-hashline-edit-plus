import { bench, describe } from "vitest";
import {
  applyHashlineEdits,
  computeLineHash,
  formatHashlineRegion,
  type HashlineEdit,
} from "../src/hashline";

const lines = Array.from({ length: 10_000 }, (_, index) =>
  `line ${index + 1}: deterministic benchmark payload`,
);
const content = lines.join("\n");
const edits: HashlineEdit[] = [100, 5_000, 9_900].map((line) => ({
  op: "replace",
  pos: { line, hash: computeLineHash(line, lines[line - 1]) },
  lines: [`line ${line}: replacement payload`],
}));
const options = { iterations: 50, warmupIterations: 10 };

describe("10k-line hashline baseline", () => {
  bench("format read anchors", () => {
    formatHashlineRegion(lines, 1);
  }, options);

  bench("apply three anchored replacements", () => {
    applyHashlineEdits(content, edits);
  }, options);
});
