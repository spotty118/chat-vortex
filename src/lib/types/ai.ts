// Core AI types and interfaces

export interface APIErrorParams {
  message: string;
  status?: number;
  code?: any;
  details?: any;
}

export class APIError extends Error {
  status?: number;
  code?: any;
  details?: any;

  constructor(errorObj: APIErrorParams) {
    super(errorObj.message);
    this.name = 'APIError';
    this.status = errorObj.status;
    this.code = errorObj.code;
    this.details = errorObj.details;
  }
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Import ThoughtStep type
import { ThoughtStep } from '../chainOfThought';

export interface MessageMetadata {
  toolCalls?: Array<{
    name: string;
    arguments: any;
  }>;
  model?: string;
  provider?: string;
  tokens?: number;
  processingTime?: number;
  error?: boolean;
  sources?: Array<{
    title: string;
    source: string;
    score: number;
  }>;
  thoughtSteps?: ThoughtStep[]; // Add thoughtSteps to metadata
}

export interface MessageWithMetadata extends ChatMessage {
  metadata?: MessageMetadata;
  usage?: TokenUsage;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  name?: string;
  tokens?: number;
  metadata?: MessageMetadata;
  streaming?: boolean;
  chunks?: StreamChunk[];
  error?: Error | null;
  duration?: number;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: any[];
  top_p?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: TokenUsage;
}

export interface StreamingOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (result: { content: string; chunks: StreamChunk[]; duration: number }) => void;
  onError?: (error: Error) => void;
  processChunk?: (chunk: StreamChunk) => string;
  bufferSize?: number;
  flushInterval?: number;
}

export interface StreamChunk {
  content: string;
  [key: string]: any;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

export type ContentFormat = 
  | 'text'
  | 'markdown'
  | 'json'
  | 'xml'
  | 'html'
  | 'code'
  | 'image'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'csv'
  | 'binary';
