import { ChatMessage } from '../types';

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface MessageWithMetadata extends ChatMessage {
  metadata?: Record<string, any>;
  usage?: TokenUsage;
}