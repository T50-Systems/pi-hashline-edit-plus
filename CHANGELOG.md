# Changelog

## 0.1.1 - 2026-07-01

### Added
- Expanded CI matrix to include Ubuntu, Windows, and macOS on Node.js 20 and 22.
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
