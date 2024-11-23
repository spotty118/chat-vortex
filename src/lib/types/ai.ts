import { ChatMessage } from '../types';

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AIMetadata {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface MessageWithMetadata extends ChatMessage {
  metadata?: AIMetadata;
  usage?: TokenUsage;
}