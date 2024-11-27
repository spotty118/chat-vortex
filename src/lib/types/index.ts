export type ModelCapability = 
  | "chat"
  | "code"
  | "analysis"
  | "vision"
  | "streaming"
  | "attachments";

export interface Provider {
  id: string;
  name: string;
  logo: string;
  description: string;
  models: Model[];
  status: 'online' | 'maintenance' | 'offline';
  features: ProviderFeatures;
}

export interface Model {
  id: string;
  name: string;
  capabilities: ModelCapability[];
  pricing?: {
    prompt: number;
    completion: number;
  };
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
  preview: string;
  createdAt: number;
  updatedAt: number;
}