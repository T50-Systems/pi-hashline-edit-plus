# Repository controls

This document is the maintainer contract for GitHub-hosted controls. Repository settings are administered separately from source changes; source-only pull requests must not silently weaken them.

## Protected `main` branch

The `ci` workflow publishes these stable required-check names:

- `ci-linux-node22`
- `ci-windows-node22`
- `ci-macos-node22`

`main` must require all three checks with strict/up-to-date branches. The existing zero-approval pull-request policy remains valid: a pull request may merge without an approval only after every required check succeeds. Force pushes and branch deletion remain disabled.

Verify the live settings through the GitHub API:

```bash
GH_TOKEN="$(gh auth token)" npm run repository:check

gh api repos/T50-Systems/pi-hashline-edit-plus/branches/main/protection \
  --jq '{strict:.required_status_checks.strict, checks:(.required_status_checks.checks // .required_status_checks.contexts), force_pushes:.allow_force_pushes.enabled, deletions:.allow_deletions.enabled}'
```

The verification command is read-only and fails if a check is absent, strict mode is off, force pushes or deletion are enabled, or a required security control is disabled. Administrators should preview branch-protection updates, retain `required_approving_review_count: 0`, and compare the resulting API response before considering the change complete.

## GitHub security controls

The repository security configuration must expose private vulnerability reporting and report these controls as enabled:

- private vulnerability reporting;
- secret scanning;
- secret scanning push protection;
- Dependabot security updates.

`.github/dependabot.yml` additionally schedules weekly npm and GitHub Actions version-update pull requests every Monday at 09:00 UTC. These schedules complement, rather than replace, security updates.

Read-only verification endpoints:

```bash
gh api repos/T50-Systems/pi-hashline-edit-plus/private-vulnerability-reporting
gh api repos/T50-Systems/pi-hashline-edit-plus --jq '.security_and_analysis'
gh api repos/T50-Systems/pi-hashline-edit-plus/dependabot/alerts --paginate
```

## GitHub Actions pin policy

Every non-local `uses:` reference in `.github/workflows/` must use a reviewed lowercase 40-character commit SHA and end with the corresponding release comment, for example:

```yaml
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

`npm run workflow:check` enforces this policy and runs the locked, WebAssembly build of `actionlint` locally. The validation is offline after `npm ci`: it does not resolve tags or download action metadata while checking workflow structure, semantics, expression types, or pins. Negative fixtures under `test/fixtures/workflows/` prove malformed workflow keys, invalid expressions, and mutable action references fail closed.

### Reviewed pins

Review recorded 2026-07-15:

| Action | Release | Reviewed SHA | Evidence |
| --- | --- | --- | --- |
| `actions/checkout` | [`v4.2.2`](https://github.com/actions/checkout/releases/tag/v4.2.2) | `11bd71901bbe5b1630ceea73d27597364c9af683` | Official tag resolves directly to this commit; GitHub reports a valid commit signature; the `v4.2.1...v4.2.2` source and bundled-distribution diff was reviewed. |
| `actions/setup-node` | [`v4.4.0`](https://github.com/actions/setup-node/releases/tag/v4.4.0) | `49933ea5288caeca8642d1e84afbd3f7d6820020` | Official tag resolves directly to this commit; GitHub reports a valid commit signature; the `v4.3.0...v4.4.0` source, metadata, dependency, and bundled-distribution diff was reviewed. |
| `actions/upload-artifact` | [`v4.6.2`](https://github.com/actions/upload-artifact/releases/tag/v4.6.2) | `ea165f8d65b6e75b540449e92b4886f43607fa02` | Official tag resolves directly to this commit; GitHub reports a valid commit signature; the `v4.6.1...v4.6.2` dependency and bundled-distribution diff was reviewed. |

The review also confirmed that the existing workflow permissions remain unchanged (`contents: read` in CI and `contents: write` only in the release job) and that no action update changes the stable required-check names.

### Advancing a pin

Dependabot may propose GitHub Actions updates, but its pull request is a notification, not review evidence. Before changing a SHA, a maintainer must:

1. confirm the release is published by the action's official repository and read its release notes and security advisories;
2. resolve the release tag with `gh api repos/OWNER/REPO/git/ref/tags/VERSION`, dereferencing an annotated tag when necessary, and verify the resulting value is the exact lowercase 40-character commit SHA proposed;
3. inspect `gh api repos/OWNER/REPO/commits/SHA` for signature verification and compare the prior reviewed release to the proposed release, including `action.yml`, source, dependencies, and checked-in `dist/` changes;
4. review requested inputs, runtime changes, network behavior, and the calling workflow's least-privilege `permissions`;
5. update the SHA and trailing release comment together, then update the reviewed-pins table with the date and evidence;
6. run `npm ci`, `npm run workflow:check`, `npm run typecheck`, `npm run check`, `npm run package:check`, `npm run security:signatures`, `npm audit --audit-level=high`, and `npm test` before relying on required CI checks.

Do not merge an update when the tag target, generated distribution, provenance, or permission impact cannot be explained. Never replace a reviewed SHA with a mutable branch, major tag, or floating tag.

### Issue #26 scope boundary

Issue #26 changes only plus-owned CI/release supply-chain controls and their validation evidence. It does not change the Node support policy tracked in issue #27, synchronize RimuruW 0.8.3 semantics, or update `pi-anchor-edit-core`. No base, core, or upstream update is required for issue #26.

## Triage ownership and cadence

A T50-Systems repository administrator owns incoming private reports and GitHub security alerts. The owner must:

1. acknowledge private reports within two business days;
2. review new Dependabot and secret-scanning alerts at least weekly;
3. classify reachability and severity, assign remediation, and keep sensitive evidence private;
4. revoke exposed credentials immediately and coordinate history cleanup when necessary;
5. document false-positive rationale in the private alert or advisory before dismissal;
6. rerun `npm audit`, `npm audit signatures`, and `npm run repository:check` after remediation.

If the designated owner is unavailable, another T50-Systems organization owner assumes the queue; alerts must not be redirected to public issues.
