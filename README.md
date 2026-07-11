# pi-hashline-edit-plus

Cross-platform Pi extension that overrides `read` and `edit` with a hash-anchored workflow designed to avoid fragile exact-text edit failures.

`pi-hashline-edit-plus` tracks the upstream [`RimuruW/pi-hashline-edit`](https://github.com/RimuruW/pi-hashline-edit) core (currently aligned with upstream `0.7.0`) and adds a T50 plus layer for release-ready, global Pi use on Windows, Linux, and macOS. The hashline editing approach was pioneered by [`oh-my-pi`](https://github.com/can1357/oh-my-pi).

## Why this helps

Pi's native edit behavior is intentionally strict: `oldText` must match exactly, including whitespace and line endings. That often fails when:

- a model copies text imperfectly;
- a file changed after the last read;
- a repository mixes `CRLF` and `LF`;
- multiple edits target ambiguous text;
- stale anchors need clear recovery guidance.

Hashline anchors target explicit line references from the latest read output instead of relying only on raw text matching.

## Tool behavior

### `read`

Returns text files as `LINE#HASH:content`:

```text
 8#VR:function hello() {
 9#KT:  console.log("world");
10#BH:}
```

### `edit`

Edits by anchor:

```json
{
  "path": "src/main.ts",
  "edits": [
    { "op": "replace", "pos": "11#KT", "lines": ["  console.log('hashline');"] }
  ]
}
```

Supported operations:

- `replace`
- `append`
- `prepend`
- `replace_text`

The package also accepts native Pi-style compatibility payloads and normalizes them before validation when possible.

## What the plus layer adds

- Windows-friendly test coverage.
- CI matrix for Linux, Windows, and macOS.
- Node.js 22 validation.
- CRLF notes in `read` output and line-ending preservation on write.
- Global Pi install guidance.
- Release packaging metadata and tag-based GitHub release automation.
- Shared anchor/edit primitives from [`pi-anchor-edit-core`](https://github.com/T50-Systems/pi-anchor-edit-core).
- Documented upstream sync policy in [`docs/upstream.md`](docs/upstream.md).

## Project documentation

- [`docs/product-and-roadmap.md`](docs/product-and-roadmap.md): vision, measurable outcomes, issue grouping, and prioritization.
- [`docs/architecture.md`](docs/architecture.md): runtime flow, ownership boundaries, extension points, and test map.
- [`docs/operations.md`](docs/operations.md): supported configuration, host-only metrics, diagnostics, and recovery runbook.
- [`docs/examples.md`](docs/examples.md): anchored edits, compatibility input, CRLF, recovery, and host integration recipes.
- [`docs/release-and-stability.md`](docs/release-and-stability.md): support matrix, release verification, upgrades, and rollback.

## Repository layout

```text
index.ts             Pi extension entrypoint
src/read.ts          read override implementation
src/edit.ts          edit override implementation
src/hashline.ts      hashline parsing/resolution
src/edit-*.ts        normalization, rendering, diff, response helpers
src/fs-write.ts      safe write behavior and permissions handling
prompts/             read/edit prompt snippets and guidelines
test/                core, tool, integration, prompt, maintenance, and permission tests
benchmark/           deterministic performance scenarios
scripts/             repository and release verification
docs/                product, architecture, operations, examples, release policy, and ADRs
```

## Quickstart

### Prerequisites

- [Node.js](https://nodejs.org/) 22 (the version used in CI)
- npm (included with Node.js)
- Pi with `@earendil-works/pi-coding-agent >= 0.74.0`

### Install globally from GitHub

```bash
pi install git:github.com/T50-Systems/pi-hashline-edit-plus@v0.1.3
```

Verify that Pi registered the package:

```bash
pi list
```

The output should include `git:github.com/T50-Systems/pi-hashline-edit-plus@v0.1.3`. Start a new Pi session after installing so the tool overrides are loaded.

### Try the anchor workflow

1. Ask Pi to `read` a text file. Each returned line has a `LINE#HASH:` prefix.
2. Copy a fresh `LINE#HASH` token into an `edit` request.
3. Use the fresh anchors returned by the successful edit for any follow-up edit.

```json
{
  "path": "src/main.ts",
  "edits": [
    { "op": "replace", "pos": "11#KT", "lines": ["  console.log('hashline');"] }
  ]
}
```

Anchors are snapshots of line content. If the file changes after `read`, read it again rather than guessing an updated anchor.

### Install from a local checkout

```bash
git clone https://github.com/T50-Systems/pi-hashline-edit-plus.git
cd pi-hashline-edit-plus
npm ci
npm run check
pi install .
```

### Troubleshooting

- **Package is absent from `pi list`:** rerun the install command and check its error output; for a local checkout, run it from the repository root.
- **Built-in `read` or `edit` still appears:** restart Pi after installation and check for another package that overrides the same tools.
- **`[E_STALE_ANCHOR]`:** retry with the current anchors included in the error, or run `read` again.
- **`[E_INVALID_PATCH]`:** confirm every edit has a supported `op`, uses anchors copied verbatim, and does not include `LINE#HASH:` inside `lines`.
- **Permission errors:** verify the target is writable. Atomic replacement may require write access to both the file and its parent directory.

See the full error-to-action table in [`docs/operations.md`](docs/operations.md) and realistic workflows in [`docs/examples.md`](docs/examples.md).

## Usage notes

- Use `read` before `edit` unless you already have fresh anchors.
- Batch every change to one file into a single `edit` call.
- If `read` reports `CRLF`, edits still preserve `CRLF` on write.
- Prefer anchor-based edits over `replace_text` when anchors are available.
- On `[E_STALE_ANCHOR]`, retry with the replacement anchors returned in the error.

## Compatibility and stability

`0.1.x` supports Pi packages at or above:

- `@earendil-works/pi-ai >= 0.74.0`
- `@earendil-works/pi-coding-agent >= 0.74.0`

The supported CI matrix is Ubuntu, Windows, and macOS on Node.js 22. See [`docs/release-and-stability.md`](docs/release-and-stability.md) for release automation and stability criteria.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the clone-to-verified-change workflow, repository map, test conventions, and pull request checklist. Security reports and dependency-trust guidance are in [`SECURITY.md`](SECURITY.md).

## License

MIT
