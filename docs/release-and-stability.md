# Release and stability policy

This package is still in the `0.1.x` line. Treat it as usable but not yet API-stable.

## Supported test matrix

Every change that affects runtime behavior must pass CI on:

- Ubuntu latest
- Windows latest
- macOS latest
- Node.js 22

Windows remains a first-class target because this package exists largely to make Pi edits reliable on Windows and mixed `CRLF`/`LF` repositories.

## Minimum Pi compatibility

`0.1.x` supports Pi packages at or above:

- `@earendil-works/pi-ai >= 0.74.0`
- `@earendil-works/pi-coding-agent >= 0.74.0`

Do not raise the minimum Pi version in a patch release unless the change fixes a critical incompatibility. If the minimum changes, update `package.json`, this document, the README, and the changelog in the same PR.

## Release automation

Releases are published by the `release` GitHub Actions workflow. Release metadata is checked locally and in CI so package, lockfile, changelog, and tag drift fails before publication.

1. Add user-visible changes under `## [Unreleased]` in `CHANGELOG.md`.
2. Choose the version, update `package.json` and `package-lock.json`, then promote the notes to a dated `## X.Y.Z - YYYY-MM-DD` section. Keep an empty `## [Unreleased]` section for future work.
3. Run `npm run check`, `npm run package:check`, and (when registry access is available) `npm run security:signatures`. `npm run check` includes `npm run release:check`.
4. Merge to `main` after the full OS matrix passes.
5. Create and push a tag matching the package version, for example `v0.1.3`.
6. The release workflow reruns `npm run release:check -- "$TAG"`, the full check suite, and packaging before creating a GitHub Release artifact.

To verify a proposed tag without publishing:

```bash
npm run release:check -- v0.1.3
```

Safe upgrades should use an immutable version tag. Review the release's changelog section, confirm the documented minimum Pi version, install the new tag, restart Pi, and exercise one read/edit/recovery loop before broad rollout. Keep the prior tag available for rollback.

## Criteria for leaving `0.1.x`

Move to `1.0.0` only after all of the following are true:

- At least three consecutive patch releases have no known data-loss or line-ending regressions.
- The read/edit tool payload schemas are documented and covered by tests.
- Stale-anchor recovery, compound edits, `replace_text`, CRLF preservation, permission errors, and binary-file handling have regression tests.
- The full Windows/Linux/macOS CI matrix is required and passing.
- Minimum Pi compatibility is explicit and validated against a supported Pi version range.
- Release automation has successfully produced at least one `0.1.x` GitHub Release artifact.
- The README documents installation, verification, compatibility, and support status.
