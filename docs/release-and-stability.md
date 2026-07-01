# Release and stability policy

This package is still in the `0.1.x` line. Treat it as usable but not yet API-stable.

## Supported test matrix

Every change that affects runtime behavior must pass CI on:

- Ubuntu latest
- Windows latest
- macOS latest
- Node.js 20 and 22

Windows remains a first-class target because this package exists largely to make Pi edits reliable on Windows and mixed `CRLF`/`LF` repositories.

## Minimum Pi compatibility

`0.1.x` supports Pi packages at or above:

- `@earendil-works/pi-ai >= 0.74.0`
- `@earendil-works/pi-coding-agent >= 0.74.0`

Do not raise the minimum Pi version in a patch release unless the change fixes a critical incompatibility. If the minimum changes, update `package.json`, this document, the README, and the changelog in the same PR.

## Release automation

Releases are published by the `release` GitHub Actions workflow.

1. Update `package.json` version and `CHANGELOG.md`.
2. Ensure `npm run check` passes locally.
3. Merge to `main` after CI passes.
4. Create and push a tag matching the package version, for example `v0.1.1`.
5. The workflow verifies the tag matches `package.json`, runs the full check suite, builds `npm pack`, and creates a GitHub Release with the package artifact.

## Criteria for leaving `0.1.x`

Move to `1.0.0` only after all of the following are true:

- At least three consecutive patch releases have no known data-loss or line-ending regressions.
- The read/edit tool payload schemas are documented and covered by tests.
- Stale-anchor recovery, compound edits, `replace_text`, CRLF preservation, permission errors, and binary-file handling have regression tests.
- The full Windows/Linux/macOS CI matrix is required and passing.
- Minimum Pi compatibility is explicit and validated against a supported Pi version range.
- Release automation has successfully produced at least one `0.1.x` GitHub Release artifact.
- The README documents installation, verification, compatibility, and support status.
