export function extractReleaseNotes(changelog: string, requestedTag: string): string;

export function verifyRuntimeDependencySpecs(
  dependencies?: Record<string, unknown>,
  lockRoot?: any,
  lockPackages?: Record<string, any>,
): string[];

export function verifyReleaseMetadata(
  root: string,
  expectedTag?: string,
): Promise<{ name: string; version: string; tag: string; notes: string }>;
