import { createAI } from 'ai/rsc';
import { Provider } from './types';
import type { ChatMessage } from './types';

export type AIState = {
  provider: Provider | null;
  modelId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  input?: string;
};

export interface AIActions {
  setProvider: (provider: Provider) => void;
  setModel: (modelId: string) => void;
  submitMessage: (message: string) => Promise<void>;
}

const initialAIState: AIState = {
  provider: null,
  modelId: null,
  messages: [],
  isLoading: false,
};

export const AI = createAI({
  actions: {
    setProvider: async (provider: Provider) => {
      return { provider };
    },
    setModel: async (modelId: string) => {
      return { modelId };
    },
    submitMessage: async (message: string, { state, dispatch }) => {
      dispatch({ isLoading: true });
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...state.messages, { role: 'user', content: message }],
            provider: state.provider,
            modelId: state.modelId
          }),
        });

        const data = await response.json();
        
        return {
          messages: [
            ...state.messages,
            { role: 'user', content: message },
            { role: 'assistant', content: data.message }
          ],
          isLoading: false
        };
      } catch (error) {
        console.error('Error submitting message:', error);
        return { isLoading: false };
      }
    },
  },
  initialAIState: initialAIState,
});
