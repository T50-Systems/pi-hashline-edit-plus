export interface WorkflowIssue {
  file: string;
  line: number;
  column: number;
  message: string;
  kind: string;
}

export function validateActionPins(source: string, filePath: string): WorkflowIssue[];
export function discoverWorkflowFiles(root?: string): Promise<string[]>;
export function validateWorkflowFiles(filePaths: readonly string[]): Promise<WorkflowIssue[]>;
