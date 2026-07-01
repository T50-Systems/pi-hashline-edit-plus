# pi-hashline-edit-plus Context

## Domain

`pi-hashline-edit-plus` is a Pi extension that replaces the built-in `read` and `edit` tools with hashline-anchored text editing. It keeps `RimuruW/pi-hashline-edit` as upstream core and layers cross-platform operation, release automation, and stability policy on top.

## Core terms

- Hashline: model-visible line prefix `LINE#HH:` where `HH` is a 2-character content hash.
- Anchor: `LINE#HH` token copied from `read` output and used by `edit` as stable edit position.
- Changed response: `edit` success text that returns only fresh anchors around affected lines.
- Details: host-only structured metadata. Model-facing text must not rely on `details` for next action.
- Canonical request: normalized edit request `{ path, edits }` after dialect convergence.

## Architecture invariants

- Runtime never relocates stale anchors or autocorrects malformed diffs.
- `normalizeEditRequest` is sole dialect-convergence layer for native Pi edit shapes and JSON-string edits.
- `assertEditRequest` validates only public request envelope; `resolveEditAnchors` owns per-edit validation.
- Successful edits return fresh anchors in text; broad file/range payloads require `read`.
- All writes go through `writeFileAtomically`.


## Upstream policy

- Upstream core: `RimuruW/pi-hashline-edit`.
- Current baseline: `pi-hashline-edit@0.7.0`.
- Keep core hashline semantics aligned with upstream unless a safety or Pi-compatibility reason is documented.
- Plus-owned areas are CI, release automation, Windows/CRLF hardening, packaging, and stability documentation.
- Review `docs/upstream.md` before release or before changing core edit/read semantics.
