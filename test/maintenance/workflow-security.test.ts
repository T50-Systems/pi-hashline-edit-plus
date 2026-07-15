import path from "node:path";
import { describe, expect, it } from "vitest";
import { discoverWorkflowFiles, validateWorkflowFiles } from "../../scripts/verify-workflows.mjs";

const root = process.cwd();
const fixture = (name: string) => path.join(root, "test", "fixtures", "workflows", name);

describe("GitHub Actions workflow validation", () => {
  it("accepts repository workflows with strict semantics and immutable action pins", async () => {
    const workflows = await discoverWorkflowFiles(root);

    expect(await validateWorkflowFiles(workflows)).toEqual([]);
  });

  it("rejects malformed workflow semantics offline", async () => {
    const errors = await validateWorkflowFiles([fixture("malformed-workflow.yml")]);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "syntax-check",
          message: expect.stringMatching(/runs-on|unexpected key/i),
        }),
      ]),
    );
  });

  it("rejects malformed expressions offline", async () => {
    const errors = await validateWorkflowFiles([fixture("malformed-expression.yml")]);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "expression",
          message: expect.stringMatching(/matrix|property/i),
        }),
      ]),
    );
  });

  it("rejects mutable third-party action references", async () => {
    const errors = await validateWorkflowFiles([fixture("mutable-action.yml")]);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "action-pin",
          message: expect.stringMatching(/lowercase 40-character commit SHA/),
        }),
        expect.objectContaining({
          kind: "action-pin",
          message: expect.stringMatching(/release comment/),
        }),
      ]),
    );
  });
});
