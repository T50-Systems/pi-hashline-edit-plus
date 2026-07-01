# pi-hashline-edit-plus

Cross-platform Pi extension that overrides the built-in `read` and `edit` tools with a hash-anchored workflow designed to avoid fragile `oldText must match exactly` failures.

It is especially useful on:
- Windows projects
- repos with mixed `CRLF`/`LF`
- models that are flaky with Pi's exact-text `edit`

This package keeps [RimuruW/pi-hashline-edit](https://github.com/RimuruW/pi-hashline-edit) as its upstream core, currently tracking upstream `0.7.0`, and adds a `plus` layer focused on release-ready, cross-platform operation for global Pi use. The hashline editing approach was pioneered by [oh-my-pi](https://github.com/can1357/oh-my-pi).

## What it changes

### `read`
Returns text files as `LINE#HASH:content`:

```text
 8#VR:function hello() {
 9#KT:  console.log("world");
10#BH:}
```

### `edit`
Edits by anchor instead of raw exact-match text:

```json
{
  "path": "src/main.ts",
  "edits": [
    { "op": "replace", "pos": "11#KT", "lines": ["  console.log('hashline');"] }
  ]
}
```

Supported ops:
- `replace`
- `append`
- `prepend`
- `replace_text`

The package still accepts native Pi-style compatibility payloads and normalizes them before validation when possible.

## Why this helps

Pi's built-in `edit` is strict by design: `oldText` must match exactly, including whitespace and newlines. That breaks often when:
- the model copies text imperfectly
- the file changed after `read`
- the repo uses `CRLF`
- the model sends ambiguous multi-edit payloads

Hashline anchors reduce that fragility by targeting explicit line references from the latest `read`.

## What `plus` adds

- Windows-friendly test suite
- CI matrix for Linux, Windows, and macOS
- Node.js 20 and 22 validation
- CRLF note in `read` output, with preserved line endings on write
- global Pi install instructions
- release packaging metadata and tag-based GitHub release automation

Core hashline semantics should stay aligned with upstream unless a safety or Pi-compatibility reason is documented. See [`docs/upstream.md`](docs/upstream.md) for the upstream sync policy.

## Install

### Global Pi install from GitHub

```bash
pi install git:github.com/T50-Systems/pi-hashline-edit-plus@v0.1.0
```

### Local checkout

```bash
git clone https://github.com/T50-Systems/pi-hashline-edit-plus
cd pi-hashline-edit-plus
pi install .
```

## Verify

```bash
pi list
```

You should see `git:github.com/T50-Systems/pi-hashline-edit-plus@v0.1.0` in your global packages.

## Usage notes

- Use `read` before `edit` unless you already have fresh anchors.
- Batch all edits for one file into a single `edit` call.
- If `read` says the file uses `CRLF`, edits still preserve `CRLF` on write.
- Prefer anchor-based edits over `replace_text`.

## Compatibility and stability

`0.1.x` supports Pi packages at or above:

- `@earendil-works/pi-ai >= 0.74.0`
- `@earendil-works/pi-coding-agent >= 0.74.0`

The supported CI matrix is Ubuntu, Windows, and macOS on Node.js 20 and 22.
See [`docs/release-and-stability.md`](docs/release-and-stability.md) for release automation and the criteria for moving from `0.1.x` to a stable release. See [`docs/upstream.md`](docs/upstream.md) for how this fork tracks upstream core changes.

## Development

```bash
npm install
npm run check
```

## License

MIT
