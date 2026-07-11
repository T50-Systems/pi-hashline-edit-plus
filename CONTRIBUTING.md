# Contributing

Thanks for helping make hash-anchored edits safer across platforms.

## Prerequisites

- Git
- Node.js 22 (the CI version)
- npm
- `@earendil-works/pi-coding-agent >= 0.74.0` when manually testing the extension

No environment variables, credentials, external services, or generated fixtures are required for the test suite.

## Clone to verified change

```bash
git clone https://github.com/T50-Systems/pi-hashline-edit-plus.git
cd pi-hashline-edit-plus
npm ci
npm run check
npm run package:check
npm run security:signatures
```

`npm ci` uses the committed lockfile. `npm run check` runs TypeScript checking, production dead-code analysis, release-metadata verification, and the complete Vitest suite. `npm run package:check` previews the files that would ship without publishing anything. `npm run security:signatures` verifies registry signatures and attestations where available.

To run a narrower feedback loop:

```bash
npm run typecheck
npm run knip
npm run release:check
npm test
npm run test:watch
npm run benchmark
```

## Repository map

- `index.ts` registers the Pi tool overrides.
- `src/read.ts` and `src/edit.ts` implement the public tools.
- `src/edit-normalize.ts` is the request-dialect convergence layer.
- `src/fs-write.ts` owns atomic file replacement.
- `prompts/` contains the model-facing tool instructions.
- `test/core/`, `test/tools/`, and `test/integration/` cover the anchor engine, public tools, and multi-step behavior.
- `docs/adr/` records intentional behavior choices.
- `CONTEXT.md` lists architecture invariants that changes must preserve.
- `docs/architecture.md` documents runtime boundaries and extension points.
- `docs/operations.md` documents configuration, metrics, and recovery.
- `test/maintenance/` verifies repository and release invariants; `benchmark/` contains non-gating performance scenarios.

Read `CONTEXT.md` and `docs/upstream.md` before changing core anchor, read, or edit semantics. Plus-owned changes should remain focused on Pi compatibility, packaging, cross-platform behavior, and safety.

## Test conventions

- Put isolated semantics in `test/core/` and public tool behavior in `test/tools/`.
- Add an integration test when behavior depends on more than one read/edit operation.
- Reuse helpers from `test/support/fixtures.ts`.
- Keep tests portable across Ubuntu, Windows, and macOS. Do not assume POSIX paths, permissions, or line endings.
- Cover both `LF` and `CRLF` when a change touches file content or writes.

## Before submitting a pull request

1. Keep the change scoped to one behavior or documentation outcome.
2. Add or update tests for runtime behavior.
3. Run `npm run check`, `npm run package:check`, and `npm run security:signatures`; run `npm run benchmark` when performance-sensitive paths change.
4. Confirm no credentials, local paths, generated archives, or fixture residue are staged.
5. Explain what changed, why, and how reviewers can reproduce the validation.

For vulnerabilities or sensitive findings, follow `SECURITY.md` rather than opening a public issue.
