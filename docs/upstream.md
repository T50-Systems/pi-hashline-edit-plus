# Upstream policy

`pi-hashline-edit-plus` keeps [RimuruW/pi-hashline-edit](https://github.com/RimuruW/pi-hashline-edit) as the core implementation source.

The `plus` layer should stay focused on operation and distribution concerns:

- Windows and mixed `CRLF`/`LF` reliability
- cross-platform CI
- release automation
- compatibility/stability documentation
- packaging for global Pi use
- narrowly scoped fixes needed to keep the fork safe on supported platforms

Avoid diverging core hashline semantics unless there is a documented safety or Pi-compatibility reason.

## Current upstream baseline

- Upstream package: `pi-hashline-edit`
- Baseline version: `0.7.0`
- Baseline repository: <https://github.com/RimuruW/pi-hashline-edit>
- Plus package line: `0.1.x`

The `0.1.x` line is intentionally conservative: it treats upstream `0.7.0` behavior as the functional core and adds release/stability hardening around it.

## Sync cadence

Check upstream before every `plus` release and whenever Pi changes its tool/plugin APIs.

Run:

```bash
npm run upstream:check
```

Then compare the current upstream tag against this document and review upstream changes.

## Intake rules

Classify upstream changes before adopting them:

1. **Data-loss, stale-anchor, file-write, permission, symlink, or binary/text detection fixes**: cherry-pick promptly and release as a patch if relevant.
2. **Pi compatibility fixes**: cherry-pick before the next release, and update minimum Pi compatibility if required.
3. **Core hashline semantics changes**: adopt only with an ADR or explicit note in this document.
4. **Documentation/test-only changes**: adopt opportunistically when they reduce drift.
5. **Features that expand the tool surface**: default to not adopting until they fit the `plus` stability goals.

## Required sync notes per release

Every release PR should state:

- upstream version checked
- whether upstream changed since the current baseline
- any commits/files cherry-picked
- whether `docs/upstream.md`, `README.md`, or `CHANGELOG.md` need updates

## Drift boundaries

Expected `plus` differences:

- GitHub Actions CI/release workflows
- `docs/release-and-stability.md`
- Windows/CRLF-specific documentation and tests
- package metadata for `T50-Systems/pi-hashline-edit-plus`

Unexpected differences that need review:

- hash algorithm or anchor format changes
- stale-anchor recovery behavior
- edit operation semantics
- atomic write behavior
- file-kind detection behavior
- request normalization behavior
