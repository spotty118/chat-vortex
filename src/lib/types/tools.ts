// Tool and function calling types
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  required: string[];
  handler: (args: Record<string, any>) => Promise<any>;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
  response?: any;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}
