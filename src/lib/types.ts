// Core types for the chat application

// Supported model capabilities
export type ModelCapability =
  | "chat"
  | "code"
  | "analysis"
  | "vision"
  | "attachments"
  | "function_calling"
  | "streaming"
  | "json_mode"
  | "parallel_calls"
  | "text_to_speech"
  | "speech_to_text"
  | "embedding"
  | "image_generation";

// Input/Output format types
export type ContentFormat = "text" | "image" | "audio" | "video" | "code";

// Provider feature configuration
export type ProviderFeatures = {
  functionCalling: boolean;
  toolUse: boolean;
  parallelRequests: boolean;
  customInstructions: boolean;
  modelFinetuning: boolean;
  assistantAPI: boolean;
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
};

// Enhanced model type with detailed specifications
export type Model = {
  id: string;
  name: string;
  provider: string;
  capabilities: ModelCapability[];
  tokenCost: number;
  contextWindow: number;
  maxOutputTokens?: number;
  inputFormats: ContentFormat[];
  outputFormats: ContentFormat[];
  temperature?: number;
  streamingSupport: boolean;
  multimodal?: boolean;
  version?: string;
  releaseDate?: string;
  deprecated?: boolean;
  pricing?: {
    prompt: number;
    completion: number;
    training?: number;
  };
};

// Provider status and configuration
export type ProviderStatus = "online" | "maintenance" | "offline" | "rate_limited";

export type Provider = {
  id: string;
  name: string;
  logo: string;
  description: string;
  models: Model[];
  status: ProviderStatus;
  icon?: React.ComponentType;
  features: ProviderFeatures;
  documentation?: string;
  supportedRegions?: string[];
  apiVersion?: string;
  customConfig?: Record<string, any>;
};

// Enhanced message content types
export type MessageContent = {
  text?: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  code?: {
    content: string;
    language: string;
  };
  attachments?: Array<{
    type: ContentFormat;
    url: string;
    metadata: Record<string, any>;
  }>;
};

// Tool and function calling types
export type FunctionDefinition = {
  name: string;
  description: string;
  parameters: Record<string, any>;
};

export type ChatCompletionTool = {
  type: 'function';
  function: FunctionDefinition;
};

export type ToolCall = {
  name: string;
  arguments: Record<string, any>;
  response?: any;
};

export type Citation = {
  text: string;
  source: string;
  url?: string;
};

// Enhanced chat message with rich content and metadata
export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "tool" | "function";
  content: string | MessageContent;
  timestamp: number;
  tokens?: number;
  metadata?: {
    toolCalls?: ToolCall[];
    citations?: Citation[];
    confidence?: number;
    processingTime?: number;
    model?: string;
    provider?: string;
    cost?: number;
  };
  streaming?: boolean;
  chunks?: StreamChunk[];
  edited?: boolean;
  editedAt?: number;
};

// Conversation management types
export type ConversationMetadata = {
  id: string;
  title: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
  lastMessage: string | null;
};

export type SavedConversation = {
  id: string;
  provider: string;
  model: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  title?: string;
  summary?: string;
  tags?: string[];
  pinned?: boolean;
  sharedWith?: string[];
};

// Settings and configuration types
export type UserSettings = {
  theme: "light" | "dark" | "system";
  fontSize: number;
  language: string;
  notifications: boolean;
  defaultProvider?: string;
  defaultModel?: string;
  customInstructions?: Record<string, string>;
  apiKeys: Record<string, string>;
  costLimits?: {
    daily?: number;
    monthly?: number;
  };
};

// Analytics and performance tracking
export type UsageMetrics = {
  tokensUsed: number;
  requestCount: number;
  totalCost: number;
  averageLatency: number;
  errorRate: number;
};

// RAG (Retrieval Augmented Generation) types
export type Document = {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
};

export type SearchResult = {
  document: Document;
  score: number;
  relevance: number;
};

// Tool integration types
export type Tool = {
  name: string;
  description: string;
  parameters: Record<string, any>;
  required: string[];
  handler: (args: Record<string, any>) => Promise<any>;
};

// Tool integration result type
export type ToolResult = {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
};

// Streaming response configuration
export interface StreamingOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (result?: {
    content: string;
    chunks: StreamChunk[];
    duration: number;
  }) => void;
  onError?: (error: Error) => void;
  processChunk?: (chunk: StreamChunk) => string;
  bufferSize?: number;
  flushInterval?: number;
}

export interface StreamChunk {
  content: string;
  [key: string]: any;
}

// Chat completion response type
export type ChatCompletionResponse = {
  id: string;
  content: string;
  role: 'assistant' | 'user' | 'system';
  model?: string;
  tokens?: number;
  finishReason?: string;
  metadata?: {
    provider?: string;
    processingTime?: number;
    cost?: number;
  };
};

// Chat completion request type
export type ChatCompletionRequest = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  tools?: ChatCompletionTool[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  responseFormat?: 'text' | 'json_object';
  seed?: number;
  stop?: string | string[];
};

// Request options type
export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  timeout?: number;
}