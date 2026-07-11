export const requiredChecks: readonly string[];

export function verifyRepositorySettings(settings: {
  protection: any;
  repository: any;
  privateReporting: any;
}): { requiredChecks: readonly string[] };
