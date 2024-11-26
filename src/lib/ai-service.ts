import { Message } from 'ai';
import { Provider } from './types';

export type AIState = {
  provider: Provider | null;
  modelId: string | null;
  messages: Message[];
  isLoading: boolean;
  input?: string;
  apiKey?: string;
};

export interface AIActions {
  setProvider: (provider: Provider) => void;
  setModel: (modelId: string) => void;
  setApiKey: (apiKey: string) => void;
}

const initialAIState: AIState = {
  provider: null,
  modelId: null,
  messages: [],
  isLoading: false,
  apiKey: undefined
};

export const createAIService = () => {
  let state = { ...initialAIState };

  const getState = () => state;
  
  const setState = (newState: Partial<AIState>) => {
    state = { ...state, ...newState };
    return state;
  };

  return {
    getState,
    setState,
    actions: {
      setProvider: (provider: Provider) => {
        return setState({ provider });
      },
      setModel: (modelId: string) => {
        return setState({ modelId });
      },
      setApiKey: (apiKey: string) => {
        return setState({ apiKey });
      }
    }
  };
};

export const aiService = createAIService();
