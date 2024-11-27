export interface MessageWithMetadata {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokens?: number;
  metadata?: {
    toolCall?: any;
    toolCalls?: any[];
    model?: string;
    provider?: string;
    tokens?: number;
    processingTime?: number;
    error?: string;
    sources?: string[];
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  streaming?: boolean;
  chunks?: any[];
  edited?: boolean;
  editedAt?: number;
}

export interface ChatMessage extends MessageWithMetadata {}

export interface StreamingOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (result: StreamResult) => void;
  onError?: (error: Error) => void;
  processChunk?: (chunk: StreamChunk) => string;
  bufferSize?: number;
  flushInterval?: number;
}

export interface StreamChunk {
  id: string;
  content: string;
  metadata?: any;
}

export interface StreamResult {
  content: string;
  chunks: StreamChunk[];
  duration: number;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export type ContentFormat = "text" | "image" | "code" | "audio" | "video";