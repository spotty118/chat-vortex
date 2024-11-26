// Core types for the chat application

// Supported model capabilities
export type ModelCapability =
  | "chat"
  | "code"
  | "analysis"
  | "vision"
  | "streaming";

// Input/Output format types
export type ContentFormat = "text" | "image" | "code";

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
}

// Chat message type
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string;
}

// AI Actions interface
export interface AIActions {
  setProvider: (provider: Provider) => void;
  setModel: (modelId: string) => Promise<void>;
  submitMessage: (message: string) => Promise<void>;
  input?: string;
  selectedProvider?: Provider | null;
  selectedModel?: string;
}
