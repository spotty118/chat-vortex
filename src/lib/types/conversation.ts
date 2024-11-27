import { ChatMessage } from './index';

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