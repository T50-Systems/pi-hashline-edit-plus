export function verifyReleaseMetadata(
  root: string,
  expectedTag?: string,
): Promise<{ name: string; version: string; tag: string }>;
