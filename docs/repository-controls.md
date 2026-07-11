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

`.github/dependabot.yml` additionally schedules weekly npm version-update pull requests every Monday at 09:00 UTC. This schedule complements, rather than replaces, security updates.

Read-only verification endpoints:

```bash
gh api repos/T50-Systems/pi-hashline-edit-plus/private-vulnerability-reporting
gh api repos/T50-Systems/pi-hashline-edit-plus --jq '.security_and_analysis'
gh api repos/T50-Systems/pi-hashline-edit-plus/dependabot/alerts --paginate
```

## Triage ownership and cadence

A T50-Systems repository administrator owns incoming private reports and GitHub security alerts. The owner must:

1. acknowledge private reports within two business days;
2. review new Dependabot and secret-scanning alerts at least weekly;
3. classify reachability and severity, assign remediation, and keep sensitive evidence private;
4. revoke exposed credentials immediately and coordinate history cleanup when necessary;
5. document false-positive rationale in the private alert or advisory before dismissal;
6. rerun `npm audit`, `npm audit signatures`, and `npm run repository:check` after remediation.

If the designated owner is unavailable, another T50-Systems organization owner assumes the queue; alerts must not be redirected to public issues.
