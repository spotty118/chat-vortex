export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (args: any) => Promise<any>;
}

export interface ToolCall {
  name: string;
  arguments: any;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}