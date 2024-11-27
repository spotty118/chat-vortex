// Core types for the chat application

// Supported model capabilities
export type ModelCapability =
  | "chat"
  | "code" 
  | "analysis"
  | "vision"
  | "streaming"
  | "attachments";

// Provider features
export interface ProviderFeatures {
  streaming?: boolean;
  attachments?: boolean;
  codeCompletion?: boolean;
  [key: string]: boolean | undefined;
}

// Enhanced model type with detailed specifications
export interface Model {
  id: string;
  name: string;
  provider: string;
  capabilities: ModelCapability[];
  contextWindow: number;
  maxOutputTokens?: number;
  streamingSupport: boolean;
  version?: string;
  pricing?: {
    prompt: number;
    completion: number;
  };
}

// Provider type
export interface Provider {
  id: string;
  name: string;
  logo: string;
  description: string;
  models: Model[];
  status: 'online' | 'maintenance' | 'offline';
  features: ProviderFeatures;
}

// Chat message type
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
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
  error?: string | Error;
  edited?: boolean;
  editedAt?: number;
  duration?: number;
  attachment?: File;
}

export interface SavedConversation {
  id: string;
  provider: string;
  model: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ConversationMetadata {
  id: string;
  title: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
  lastMessage: string | null;
}

// Re-export types from other type files
export * from './ai';
export * from './conversation';
export * from './embedding';
export * from './models';
export * from './tools';
export * from './analytics';