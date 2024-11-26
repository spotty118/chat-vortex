import { createAI, useAIState, useActions } from 'ai/rsc';
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
  input?: string;
}

const setProvider = (provider: Provider) => {
  return {
    provider,
  };
};

const setModel = (modelId: string) => {
  // Remove direct modification of initialAIState
  return {
    modelId,
  };
};

const fetchAIResponse = async (message: string) => {
  const [currentState] = useAIState();

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      message, 
      provider: currentState.provider,
      modelId: currentState.modelId 
    }),
  });

  return await response.json();
};

const submitMessage = async (message: string) => {
  const [currentState, setState] = useAIState();
  const responseData = await fetchAIResponse(message);

  setState({
    messages: [
      ...currentState.messages,
      { role: 'user', content: message },
      { role: 'assistant', content: responseData.message }
    ]
  });
};

const initialAIState: AIState = {
  provider: null,
  modelId: null,
  messages: [],
  isLoading: false,
};

const actions: AIActions = {
  setProvider,
  setModel,
  submitMessage,
};

export const AI = createAI<AIState, AIActions>({
  initialAIState: initialAIState,
  actions: {
    setProvider,
    setModel,
    submitMessage,
  }
});
