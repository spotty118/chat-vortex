import { useState, useCallback } from 'react';
import { ChatMessage } from '@/lib/types/ai';
import { Model, Provider } from '@/lib/types';
import { sendMessage } from '@/lib/api';

type ParallelResponse = {
  modelId: string;
  provider: string;
  response: string;
  error?: string;
  timing: {
    start: number;
    end: number;
    duration: number;
  };
};

export const useParallelModels = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<ParallelResponse[]>([]);

  const callModels = useCallback(async (
    messages: ChatMessage[],
    selectedModels: Array<{ model: Model, provider: Provider }>,
    abortController?: AbortController
  ) => {
    setIsLoading(true);
    setResponses([]);

    try {
      const calls = selectedModels.map(async ({ model, provider }) => {
        const start = Date.now();
        try {
          const response = await sendMessage(
            provider,
            model.id,
            messages,
            abortController?.signal
          );

          return {
            modelId: model.id,
            provider: provider.id,
            response: response.message,
            timing: {
              start,
              end: Date.now(),
              duration: Date.now() - start
            }
          };
        } catch (error) {
          return {
            modelId: model.id,
            provider: provider.id,
            error: error.message,
            response: '',
            timing: {
              start,
              end: Date.now(),
              duration: Date.now() - start
            }
          };
        }
      });

      const results = await Promise.all(calls);
      setResponses(results);
      return results;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResponses = useCallback(() => {
    setResponses([]);
  }, []);

  return {
    isLoading,
    responses,
    callModels,
    clearResponses
  };
};