# Examples and integration recipes

Anchors below are illustrative. Always copy the exact anchors produced by the latest `read` in your session.

## Replace one line

Read the target, then send one anchored replacement:

```json
{
  "path": "src/main.ts",
  "edits": [
    { "op": "replace", "pos": "12#MQ", "lines": ["const timeoutMs = 5000;"] }
  ]
}
```

## Replace a range atomically

Batch related edits once per file. `end` is inclusive, and `lines` contains only replacement content:

```json
{
  "path": "src/main.ts",
  "edits": [
    {
      "op": "replace",
      "pos": "20#AB",
      "end": "23#CD",
      "lines": ["function ready() {", "  return true;", "}"]
    }
  ]
}
```

Do not repeat unchanged boundary lines outside `20`–`23`; doing so duplicates them.

## Insert at file boundaries

Omit `pos` to prepend at the beginning or append at the end:

```json
{
  "path": "notes.txt",
  "edits": [
    { "op": "prepend", "lines": ["Title", ""] },
    { "op": "append", "lines": ["", "End"] }
  ]
}
```

## Continue a multi-step edit

A successful edit returns an `--- Anchors A-B ---` block. Use those fresh anchors for a nearby follow-up. Read again when the next target is outside that block or another process may have modified the file.

If an edit returns `[E_STALE_ANCHOR]` with lines prefixed by `>>>`, copy the replacement anchor from that diagnostic and retry the same logical operation. Never calculate or shift anchors yourself.

## Native Pi compatibility

The adapter accepts common native Pi shapes and converges them internally. This is useful for hosts already emitting exact-text edits:

```json
{
  "path": "src/main.ts",
  "oldText": "const enabled = false;",
  "newText": "const enabled = true;"
}
```

Prefer anchored `edits` for agent-authored changes because exact-text replacement remains sensitive to whitespace and ambiguity.

## CRLF repository recipe

1. Read the file and confirm the note `Original line endings: CRLF`.
2. Supply `lines` without carriage-return characters.
3. Let the extension restore CRLF during its atomic write.
4. Run the repository's tests or line-ending checks.

## Host metrics integration

A Pi host may consume `result.details.metrics` after a call. Keep it out of prompts and avoid logging file content:

```ts
const metrics = result.details?.metrics;
if (metrics?.classification === "noop") {
  counters.hashlineNoop += 1;
}
if (metrics?.warnings > 0) {
  counters.hashlineWarnings += metrics.warnings;
}
```

Metrics are per-call local metadata, not telemetry transmitted by this extension. See `docs/operations.md` for the complete field and privacy guidance.
