# Changelog

## [Unreleased]

### Added
- Added product/KPI, architecture, operations, recovery, observability, examples, and roadmap documentation.
- Added a reproducible 10,000-line hashline benchmark and automated release-metadata verification.

## 0.1.3 - 2026-07-02

### Changed
- Adopted `pi-anchor-edit-core` for shared anchor and edit primitives.

## 0.1.2 - 2026-07-01

### Fixed
- Updated CI and stability docs to validate the cross-platform matrix on Node.js 22, matching the Pi development dependency stack used by release automation.

## 0.1.1 - 2026-07-01

### Added
- Expanded CI matrix to include Ubuntu, Windows, and macOS.
- Added tag-based GitHub release automation that verifies package/tag version alignment, runs checks, creates an npm package artifact, and publishes a GitHub Release.
- Documented minimum Pi compatibility and criteria for promoting the package from `0.1.x` to a stable release.
- Documented `RimuruW/pi-hashline-edit@0.7.0` as the upstream core baseline and added an upstream sync policy plus `npm run upstream:check`.

## 0.1.0 - 2026-06-30

Initial release of `pi-hashline-edit-plus`.

### Added
- Hashline-based `read` and `edit` overrides for Pi
- Cross-platform packaging metadata for GitHub-based Pi installs
- Windows-friendly test behavior for permissions, path matching, and symlink capability checks
- GitHub Actions CI for Windows and Ubuntu
- CRLF preservation note in `read` output

### Based on
- `oh-my-pi` hashline concept by can1357
- `pi-hashline-edit` by RimuruW
