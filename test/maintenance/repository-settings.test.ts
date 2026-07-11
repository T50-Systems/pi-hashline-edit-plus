import { describe, expect, it } from "vitest";
import { requiredChecks, verifyRepositorySettings } from "../../scripts/verify-repository-settings.mjs";

function enabledSettings() {
  return {
    protection: {
      required_status_checks: {
        strict: true,
        contexts: requiredChecks,
        checks: [],
      },
      allow_force_pushes: { enabled: false },
      allow_deletions: { enabled: false },
    },
    repository: {
      security_and_analysis: {
        dependabot_security_updates: { status: "enabled" },
        secret_scanning: { status: "enabled" },
        secret_scanning_push_protection: { status: "enabled" },
      },
    },
    privateReporting: { enabled: true },
  };
}

describe("repository settings verification", () => {
  it("accepts the complete protected-branch and security configuration", () => {
    expect(verifyRepositorySettings(enabledSettings())).toEqual({ requiredChecks });
  });

  it("rejects missing CI, update-branch, and security controls", () => {
    const settings = enabledSettings();
    settings.protection.required_status_checks.strict = false;
    settings.protection.required_status_checks.contexts = [requiredChecks[0]];
    settings.repository.security_and_analysis.secret_scanning.status = "disabled";
    settings.privateReporting.enabled = false;

    expect(() => verifyRepositorySettings(settings)).toThrow(
      /current before merge.*ci-windows-node22.*ci-macos-node22.*private vulnerability reporting.*secret scanning/s,
    );
  });
});
