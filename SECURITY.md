# Security policy

## Reporting a vulnerability

Do not open a public issue for an unpatched vulnerability or include secrets, private file contents, or exploit payloads in logs. Submit the report through **Report a vulnerability** on the repository's **Security** tab. Include affected versions, impact, minimal reproduction steps, and any suggested mitigation. A T50-Systems repository administrator acknowledges reports within two business days and keeps sensitive discussion in the private advisory.

General bugs without sensitive details can use the public issue tracker.

## GitHub security controls

Private vulnerability reporting, secret scanning, push protection, and Dependabot security updates are required repository controls. Maintainers review private reports and new alerts at least weekly, classify reachability and severity, assign remediation, and record a private rationale before dismissing a false positive. Exposed credentials are revoked immediately; sensitive evidence never moves to a public issue.

`.github/dependabot.yml` also schedules weekly npm and GitHub Actions dependency-update pull requests. `docs/repository-controls.md` documents ownership, action-pin review evidence, advancement, API verification, escalation, and recovery. Run `npm run workflow:check` for offline workflow semantics, expression, and pin-policy validation; run `GH_TOKEN="$(gh auth token)" npm run repository:check` for a read-only live-settings check.

## Extension trust boundary

This extension runs inside Pi with the same filesystem permissions as the Pi process. Its `read` and `edit` tools can access paths the user account can access; there is no sandbox or separate privilege boundary.

The package:

- does not require environment variables, tokens, or network credentials;
- does not send file contents or edit payloads to a service of its own;
- writes through atomic local file replacement;
- depends on Pi for model-provider communication, tool authorization, and package loading.

Review the source and lockfile before installing from an untrusted fork or mutable branch. Prefer a version tag when installing from GitHub.

## Secret and log handling

- Never add API keys, auth files, `.env` files, private keys, or provider transcripts to tests or fixtures.
- Use obviously fake values in examples.
- Treat read output, stale-anchor diagnostics, diffs, and test failures as potentially sensitive because they can contain source lines and local paths.
- Redact sensitive content before sharing CI logs or issue reproductions.
- Keep local credentials outside the repository. Common environment, key, certificate, and npm credential files are ignored by `.gitignore`.

## Dependency review

Install with `npm ci` so the committed lockfile is honored. Pull requests run `npm audit signatures` to verify registry signatures and attestations where the registry provides them. Maintainers should also review lockfile changes and run:

```bash
npm audit
npm audit signatures
npm ls --all
```

An audit finding is not automatically reachable from this extension. Triage whether the dependency is runtime or development-only, whether the vulnerable API is used, and whether the fix is compatible before updating. Document accepted risk rather than silently suppressing a finding.

Git-sourced dependencies deserve extra review because registry attestations do not cover them. The shared `pi-anchor-edit-core` dependency is pinned to the reviewed `fa10abb76aee5e745ad291aff4448b09fd1cb47d` commit through an HTTPS archive with lockfile integrity. `npm run release:check` rejects mutable runtime GitHub dependency specifications and verifies that full-commit pins match the lockfile resolution.

## Version scope

No supported-version guarantee has been published for this pre-1.0 package. Reproduce reports against the latest release and state every version known to be affected.
