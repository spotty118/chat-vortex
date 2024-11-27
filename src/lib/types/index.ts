export type ModelCapability = 
  | "chat"
  | "code"
  | "analysis"
  | "vision"
  | "streaming"
  | "attachments";

export interface Model {
  id: string;
  name: string;
  capabilities: ModelCapability[];
  pricing?: {
    prompt: number;
    completion: number;
  };
  contextWindow?: number;
  inputFormats?: string[];
  outputFormats?: string[];
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

export interface ProviderFeatures {
  [key: string]: boolean;
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