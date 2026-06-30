# pi-hashline-edit-plus

Cross-platform Pi extension that overrides the built-in `read` and `edit` tools with a hash-anchored workflow designed to avoid fragile `oldText must match exactly` failures.

It is especially useful on:
- Windows projects
- repos with mixed `CRLF`/`LF`
- models that are flaky with Pi's exact-text `edit`

This package is based on the hashline editing approach pioneered by [oh-my-pi](https://github.com/can1357/oh-my-pi) and the excellent [RimuruW/pi-hashline-edit](https://github.com/RimuruW/pi-hashline-edit) package. This repo focuses on a release-ready, cross-platform variant for global Pi use.

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

## Cross-platform improvements in this fork

- Windows-friendly test suite
- CI ready for Linux + Windows
- CRLF note in `read` output, with preserved line endings on write
- global Pi install instructions
- release packaging metadata

## Install

### Global Pi install from GitHub

```bash
pi install git:github.com/cervantesh/pi-hashline-edit-plus@v0.1.0
```

### Local checkout

```bash
git clone https://github.com/cervantesh/pi-hashline-edit-plus
cd pi-hashline-edit-plus
pi install .
```

## Verify

```bash
pi list
```

You should see `git:github.com/cervantesh/pi-hashline-edit-plus@v0.1.0` in your global packages.

## Usage notes

- Use `read` before `edit` unless you already have fresh anchors.
- Batch all edits for one file into a single `edit` call.
- If `read` says the file uses `CRLF`, edits still preserve `CRLF` on write.
- Prefer anchor-based edits over `replace_text`.

## Development

```bash
npm install
npm run check
```

## License

MIT
