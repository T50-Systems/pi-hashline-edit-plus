import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })));
});

describe("coverage threshold enforcement", () => {
  it("fails when an intentional fixture drops below every configured budget", async () => {
    await mkdir(path.resolve(".tmp"), { recursive: true });
    const root = await mkdtemp(path.resolve(".tmp/hashline-coverage-"));
    temporaryRoots.push(root);
    await writeFile(path.join(root, "fixture.test.ts"), "it('runs', () => expect(true).toBe(true));\n");
    await writeFile(path.join(root, "uncovered.ts"), "export function uncovered(value: boolean) { return value ? 1 : 2; }\n");
    await writeFile(
      path.join(root, "vitest.config.mjs"),
      "export default { test: { globals: true, include: ['fixture.test.ts'], coverage: { provider: 'v8', enabled: true, include: ['uncovered.ts'], thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 } } } };\n",
    );

    const vitestCli = path.resolve("node_modules/vitest/vitest.mjs");
    const result = spawnSync(process.execPath, [vitestCli, "run", "--config", "vitest.config.mjs"], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(/coverage.*threshold/i);
  }, 30_000);
});
