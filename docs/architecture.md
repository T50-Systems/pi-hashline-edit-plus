# Architecture and module boundaries

## Runtime flow

```text
Pi extension loader
  -> index.ts registers read and edit overrides
  -> read: path resolution -> file classification -> normalization -> anchors + snapshot details
  -> edit: dialect normalization -> envelope validation -> mutation queue
           -> file classification -> anchor validation/application
           -> line-ending restoration -> atomic write -> fresh anchors + host details
```

The extension is local and stateless between calls. Filesystem contents and per-call snapshots are the system of record; Pi owns tool authorization, provider communication, lifecycle, and UI rendering.

## Ownership boundaries

| Boundary | Owner | Responsibilities |
| --- | --- | --- |
| Extension adapter | `index.ts` | Register tool overrides and optional debug lifecycle notification |
| Public read tool | `src/read.ts` | Validate paging, classify files, normalize text for display, return hashline anchors and host-only truncation metadata |
| Public edit tool | `src/edit.ts` | Normalize/validate requests, serialize writes per target, orchestrate edit pipeline, render results |
| Request convergence | `src/edit-normalize.ts` | Convert supported Pi request dialects into canonical `{ path, edits }` |
| Anchor engine | `src/hashline.ts`, `pi-anchor-edit-core` | Parse, validate, hash, resolve, and apply anchored operations; do not silently relocate stale anchors |
| File safety | `src/file-kind.ts`, `src/fs-write.ts`, `src/path-utils.ts`, `src/snapshot.ts` | Detect unsupported content, resolve paths/symlinks, preserve permissions, replace atomically, fingerprint snapshots |
| Presentation | `src/edit-render.ts`, `src/edit-response.ts`, prompts | Keep model-visible recovery actionable while exposing structured host-only details |
| Policy/evidence | `CONTEXT.md`, `docs/adr/`, tests, workflows | Record invariants, intentional choices, compatibility, and release gates |

## Data and control rules

1. `read` emits `LINE#HASH:content`; anchors bind line number and current line content.
2. `edit` converges compatibility inputs before schema and semantic validation.
3. The mutation queue serializes writes to the resolved target path.
4. The edit pipeline reads once, rejects unsupported/binary input, validates every anchor, and applies a batch bottom-up.
5. Writes restore BOM and line endings and use atomic replacement.
6. Success returns fresh anchors for the affected region. Rich diagnostics and metrics live in `details` and are not required for the model's next action.

## Extension points and constraints

- Add request dialect compatibility only in `src/edit-normalize.ts`; keep the published canonical schema small.
- Add file/write behavior behind the existing file-safety modules; do not write directly from tool handlers.
- Add stable behavior decisions as ADRs under `docs/adr/`.
- Keep core semantics aligned with `docs/upstream.md`; plus-owned work is cross-platform hardening, Pi compatibility, packaging, release policy, and safety.
- Do not introduce background services, telemetry transport, persistent configuration, or anchor autocorrection without explicit design and security review.

## Test map

- `test/core/`: pure anchor, diff, path, and runtime semantics.
- `test/tools/`: public read/edit behavior, rendering, permissions, metrics, and file safety.
- `test/integration/`: multi-call stale-anchor and chained-edit workflows.
- `test/prompts/`: model-facing contract examples.
- `test/extension/`: registration and lifecycle behavior.
- `test/maintenance/`: repository and release invariants.
- `benchmark/`: deterministic performance scenarios; not correctness gates.
