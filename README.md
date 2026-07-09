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

## Repository layout

```text
index.ts             Pi extension entrypoint
src/read.ts          read override implementation
src/edit.ts          edit override implementation
src/hashline.ts      hashline parsing/resolution
src/edit-*.ts        normalization, rendering, diff, response helpers
src/fs-write.ts      safe write behavior and permissions handling
prompts/             read/edit prompt snippets and guidelines
test/                core, tool, integration, prompt, and permission tests
docs/                release/stability notes and ADRs
```

## Install

### Global Pi install from GitHub

```bash
pi install git:github.com/T50-Systems/pi-hashline-edit-plus@v0.1.3
```

### Local checkout

```bash
git clone https://github.com/T50-Systems/pi-hashline-edit-plus
cd pi-hashline-edit-plus
pi install .
```

Verify with:

```bash
pi list
```

## Usage notes for agents

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

## Development

```bash
npm install
npm run typecheck
npm run knip
npm test
npm run check
```

## License

MIT
