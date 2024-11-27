import { ModelCapability } from './index';

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
  maxOutputTokens?: number;
  streamingSupport: boolean;
  version?: string;
}

export interface ProviderFeatures {
  streaming?: boolean;
  attachments?: boolean;
  codeCompletion?: boolean;
  [key: string]: boolean | undefined;
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