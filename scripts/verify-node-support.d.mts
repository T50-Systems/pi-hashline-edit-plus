export interface NodeSupportMetadata {
  packageJson: any;
  packageLock: any;
  ciWorkflow: string;
  readme: string;
  contributing: string;
  releaseStability: string;
  repositoryControls: string;
  changelog: string;
}

export const supportedNodeEngine: ">=22";
export const requiredNode22Checks: readonly string[];
export const node24CompatibilityCheck: "ci-linux-node24";

export function verifyNodeSupportMetadata(metadata: NodeSupportMetadata): {
  supportedNodeEngine: ">=22";
  requiredNode22Checks: readonly string[];
  node24CompatibilityCheck: "ci-linux-node24";
};
export function readNodeSupportMetadata(root: string): Promise<NodeSupportMetadata>;
export function verifyRepositoryNodeSupport(root: string): Promise<{
  supportedNodeEngine: ">=22";
  requiredNode22Checks: readonly string[];
  node24CompatibilityCheck: "ci-linux-node24";
}>;
