import { createAI, createStreamableUI } from 'ai/rsc';
import { Provider } from './types';
import type { ChatMessage } from './types';

export type AIState = {
  provider: Provider | null;
  modelId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
};

interface AIActions {
  setProvider: (provider: Provider) => void;
  setModel: (modelId: string) => Promise<void>;
  submitMessage: (message: string) => Promise<void>;
  input?: string;
}

const setProvider = (provider: Provider) => {
  ai.setState((draft) => {
    draft.provider = provider;
  });
};

const setModel = (modelId: string) => {
  return new Promise<void>((resolve) => {
    ai.setState((draft) => {
      draft.modelId = modelId;
    });
    resolve();
  });
};

const submitMessage = async (message: string) => {
  const state = ai.getState();
  if (!state.provider || !state.modelId) {
    throw new Error('Provider and model must be selected');
  }

  // Add user message to state
  ai.setState((draft) => {
    draft.messages.push({
      role: 'user',
      content: message,
    });
    draft.isLoading = true;
  });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: state.messages,
        provider: state.provider.id,
        model: state.modelId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let accumulatedMessage = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      accumulatedMessage += text;

      // Update UI with accumulated message
      ai.setState((draft) => {
        const lastMessage = draft.messages.find(m => m.role === 'assistant');
        if (lastMessage) {
          lastMessage.content = accumulatedMessage;
        } else {
          draft.messages.push({
            role: 'assistant',
            content: accumulatedMessage,
          });
        }
      });
    }
  } finally {
    ai.setState((draft) => {
      draft.isLoading = false;
    });
  }
};

export const ai = {
  setProvider,
  setModel,
  submitMessage,
  ...createAI<AIState, AIActions>({
    initialAIState: {
      provider: null,
      modelId: null,
      messages: [],
      isLoading: false,
    },
    initialUIState: {
      input: '',
      selectedProvider: null,
      selectedModel: '',
      setProvider,
      setModel,
      submitMessage,
    } as AIActions,
    actions: {
      setProvider,
      setModel,
      submitMessage,
      input: '',
    },
  }),
  setState(updater: (draft: AIState) => void) {
    return this.update((state) => {
      updater(state.ai);
    });
  },
  getState(): AIState {
    return this.get().ai;
  }
} as const;

// Helper types for better TypeScript support
export type AI = typeof ai;
