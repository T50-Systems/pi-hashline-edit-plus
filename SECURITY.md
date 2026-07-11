# Security policy

## Reporting a vulnerability

Do not open a public issue for an unpatched vulnerability or include secrets, private file contents, or exploit payloads in logs. Use GitHub private vulnerability reporting from the repository's **Security** tab when available; otherwise contact a T50-Systems organization owner privately. Include affected versions, impact, minimal reproduction steps, and any suggested mitigation.

General bugs without sensitive details can use the public issue tracker.

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

Git dependencies deserve extra review because registry attestations do not cover them. The shared `pi-anchor-edit-core` dependency is locked to a resolved commit in `package-lock.json`; review changes to that resolved commit like source changes.

## Version scope

No supported-version guarantee has been published for this pre-1.0 package. Reproduce reports against the latest release and state every version known to be affected.
