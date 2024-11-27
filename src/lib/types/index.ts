export type ModelCapability = 
  | "chat"
  | "code"
  | "analysis"
  | "vision"
  | "streaming"
  | "attachments";

export interface ProviderFeatures {
  [key: string]: boolean;
}

export interface Model {
  id: string;
  name: string;
  capabilities: ModelCapability[];
  pricing?: {
    prompt: number;
    completion: number;
  };
  contextWindow?: number;
  provider: string;
}

export interface Provider {
  id: string;
  name: string;
  logo: string;
  description: string;
  models: Model[];
  status: 'online' | 'maintenance' | 'offline';
  features: ProviderFeatures;
}

export interface SavedConversation {
  id: string;
  provider: string;
  model: string;
  messages: any[];
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
}