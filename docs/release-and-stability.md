# Release and stability policy

This package is still in the `0.1.x` line. Treat it as usable but not yet API-stable.

## Supported test matrix

The minimum supported Node.js version is 22 (`engines.node >=22`). Every change that affects runtime behavior must pass the required baseline CI checks on:

- Ubuntu latest on Node.js 22
- Windows latest on Node.js 22
- macOS latest on Node.js 22

Ubuntu latest on Node.js 24 provides additive compatibility coverage for the next even-numbered release line. It does not rename or replace the stable Node.js 22 required checks.

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
6. The release workflow reruns `npm run release:check -- "$TAG"`, the full check suite, and packaging, extracts only the tag's dated changelog section, then creates a GitHub Release with the npm package artifact.

To verify a proposed tag without publishing:

```bash
npm run release:check -- v0.1.3
```

To preview the exact release notes without publishing:

```bash
npm run release:notes -- v0.1.3 release-notes.md
```

The command fails when the requested tag has no matching dated changelog section. Inspect `release-notes.md` and the `npm pack --dry-run` output before creating a tag.

### v0.1.3 failure diagnosis

The `v0.1.3` tag workflow (run `28565354269`) failed during `npm ci` before checks or packaging. Its lockfile resolved `pi-anchor-edit-core` as `ssh://git@github.com/...`; the hosted runner had no SSH key and GitHub returned `Permission denied (publickey)`. The runtime dependency now uses an immutable full-commit HTTPS archive, so clean release runners do not require SSH credentials.

### Failure recovery and verification

1. Do not move, overwrite, or recreate an existing tag. Diagnose the failed run and fix source metadata on `main`.
2. Run `npm ci`, `npm run check`, `npm run package:check`, `npm audit`, and `npm run security:signatures` on the release commit.
3. Run `npm run release:check -- "v$(node -p 'require("./package.json").version')"` and extract/inspect the release-specific notes.
4. Prepare the next patch version and dated changelog section, merge it through all three required CI checks, and create a new tag for that version.
5. Verify the tag workflow completes, the GitHub Release notes contain only that version's section, and exactly one `.tgz` package artifact is attached. Download the artifact and inspect it with `npm pack --dry-run` or `tar -tf`.
6. If publication fails after a GitHub Release is created, preserve the tag and artifact evidence. Correct automation on `main` and use an explicit maintainer-reviewed recovery; never rewrite the tag to hide the failure.

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
