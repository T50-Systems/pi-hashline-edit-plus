# Product direction and roadmap

## Vision

Make text edits by coding agents predictable and recoverable on every Pi-supported desktop platform, especially when exact-text matching, concurrent changes, or mixed line endings make ordinary replacements fragile.

## Users and outcomes

- **Pi users:** install one extension and get safer `read`/`edit` behavior without changing their repository.
- **Agent authors:** receive explicit anchors, actionable failures, and fresh post-edit anchors that support reliable tool loops.
- **Maintainers:** evolve the plus layer without silently drifting from upstream anchor semantics or weakening cross-platform safety.

The project does not aim to become a general patch language, silently relocate stale edits, or add a remote service. Those choices preserve deterministic local behavior and the trust boundary documented in `SECURITY.md`.

## Success indicators

Review these indicators at each release. Until aggregate telemetry exists, use CI results, benchmark artifacts, and issue/PR samples rather than claiming population-wide measurements.

| Indicator | Initial target | Evidence |
| --- | --- | --- |
| Cross-platform correctness | Required CI passes on Ubuntu, Windows, and macOS | GitHub Actions `ci` workflow |
| Safety regressions | Zero known data-loss or line-ending regressions per release | Test suite and release checklist |
| Recovery quality | Every stable error code used in prompts has an actionable recovery path | `docs/operations.md` review |
| Edit loop quality | Stale-anchor and chained-edit integration scenarios remain covered | `test/integration/` |
| Performance | Track 10k-line anchor formatting and three-edit application; investigate repeatable >20% regressions on the same host/runtime | `npm run benchmark` JSON/history |
| Release integrity | Package, lockfile, changelog, and tag agree | `npm run release:check` |
| Adoption readiness | Install, first edit, integration, and troubleshooting examples remain current | README and `docs/examples.md` |

The performance threshold is a review trigger, not a portable pass/fail budget: shared runners and developer machines differ. Compare results only with the same Node major, OS, CPU class, and benchmark command.

## Roadmap grouping

This foundation groups the remaining open roadmap into reviewable milestones without closing or changing issue state.

### Foundation: product and maintainability

- #2 vision and success indicators: this document.
- #4 architecture and boundaries: `docs/architecture.md`.
- #6 high-risk validation: existing core/tool/integration coverage plus release-metadata drift tests.
- #8 release and changelog workflow: `docs/release-and-stability.md` and `npm run release:check`.

### Operability and user workflows

- #10 configuration: supported settings and environment behavior in `docs/operations.md`.
- #11 recovery: error-to-action runbook in `docs/operations.md`.
- #12 observability: host-only metrics and debug-mode guidance in `docs/operations.md`.
- #14 workflow polish: install/first-edit/recovery journeys in README and examples.
- #15 examples and integration: `docs/examples.md`.

### Measurement and next milestones

- #13 performance baseline: deterministic `benchmark/hashline.bench.ts` and `npm run benchmark`.
- #16 backlog triage: this grouping; future work should be split into behavior-sized issues with tests and a milestone only after evidence identifies a gap.

## Prioritization rule

Protect correctness and recovery first, compatibility second, then performance and convenience. A core semantic change requires a failing regression test or measured gap, an ADR when behavior is intentional, and an upstream-policy review. Documentation-only gaps may use the lighter contributor workflow.
