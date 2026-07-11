# Configuration, diagnostics, and recovery

## Configuration contract

The extension is intentionally zero-configuration for normal use. It requires no `.env`, credentials, network service, or persistent state.

| Setting | Values | Default | Effect |
| --- | --- | --- | --- |
| `PI_HASHLINE_DEBUG` | `1` or `true` (exact, lowercase) | unset/off | Show `Hashline Edit mode active` at Pi session start |
| `read.offset` | positive integer | `1` | Start line for a paged read |
| `read.limit` | positive integer | Pi read limit | Maximum requested lines before platform truncation limits |

Environment variables come from the process that starts Pi. For a one-session diagnostic, set `PI_HASHLINE_DEBUG=1` in that shell and restart Pi. Do not commit `.env` files. There are no separate CI, staging, or production profiles; the same package behavior runs everywhere, while CI fixes Node and OS versions through the workflow matrix.

## Diagnostics and observability

Use `pi list` to confirm the package is installed. Debug mode confirms registration, not that a particular edit succeeded.

Tool results expose structured, host-only `details`:

- read: `snapshotId`, truncation state, `nextOffset`, and `metrics.truncated`/`metrics.next_offset`;
- edit: classification (`applied` or `noop`), warnings, diff, snapshot ID, attempted/no-op edit counts, changed range, and added/removed line counts.

These fields support host UIs and local dashboards. They are not sent to an extension-owned service, are not promised as aggregate telemetry, and should not be echoed into model-facing text. Treat diffs, paths, snapshots, and logs as potentially sensitive.

Recommended release review:

1. Compare CI status across all three operating systems.
2. Record `npm run benchmark -- --outputJson <file>` on a known host when performance-sensitive code changes.
3. Compare no-op/warning classifications in focused test or host traces when edit-loop behavior changes.
4. Redact paths and file contents before sharing diagnostics.

## Recovery runbook

| Symptom | Meaning | Recovery |
| --- | --- | --- |
| Package absent from `pi list` | Install did not register | Re-run the tagged or local install from the repository root, inspect its error, then restart Pi |
| Built-in tools still appear | Session is stale or another package overrides the same names | Restart Pi; inspect installed packages and remove the conflicting override if appropriate |
| `[E_STALE_ANCHOR]` | File content no longer matches the copied anchor | Prefer the `>>> LINE#HASH:content` anchors in the error for an immediate retry; otherwise read again |
| `[E_INVALID_PATCH]` | Batch shape/ranges are invalid | Merge touching ranges, use current anchors, and remove duplicated boundary lines or `LINE#HASH:` prefixes from payload content |
| `[E_BAD_OP]` | Operation fields do not match the selected op | Use `replace` with `pos`/optional `end`; use `append`/`prepend` with optional `pos`; use `replace_text` only with `oldText`/`newText` |
| `[E_WOULD_EMPTY]` | Edit would erase a non-empty file | Provide replacement content; use an explicit filesystem deletion tool only when deletion is intended and approved |
| No changes / `noop` | Replacement equals current content | Treat as success if idempotence was intended; otherwise read current content and correct the payload |
| Permission error | File or parent cannot support atomic replacement | Check file and directory permissions, read-only flags, locks, and symlink target access |
| Binary/image rejection | Hashline edit supports text only | Use an appropriate binary/image tool; do not force a text rewrite |
| Non-UTF-8 warning | Invalid bytes were decoded as replacement characters | Stop if encoding must be preserved; convert with an encoding-aware tool before editing |
| Truncated read | Output hit line/byte limits | Continue with the reported `nextOffset`; do not guess unseen anchors |

If recovery remains ambiguous, reproduce with the smallest non-sensitive fixture, include package/Pi/Node versions and OS, and report the exact error code. Follow `SECURITY.md` for sensitive failures.
