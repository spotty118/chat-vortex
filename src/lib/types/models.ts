import { ContentFormat } from '../types';

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

// Provider feature configuration
export interface ProviderFeatures {
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
}

// Enhanced model type with detailed specifications
export interface Model {
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
  version?: string;
  releaseDate?: string;
  deprecated?: boolean;
  pricing?: {
    prompt: number;
    completion: number;
  };
}

// Provider status and configuration
export interface ProviderStatus {
  available: boolean;
  latency?: number;
  quotaRemaining?: number;
  rateLimit?: {
    remaining: number;
    reset: number;
  };
}

export interface Provider {
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
  apiKey: string;
}
