import { BaseAPIClient } from './base';
import {
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
} from '@/lib/types/ai';
import { Tool } from '@/lib/types/tools';
import { Model, ModelCapability } from '@/lib/types';
import { EmbeddingRequest, EmbeddingResponse } from '@/lib/types/embedding';

export class OpenAIClient extends BaseAPIClient {
  [x: string]: any;
  beta: {
    assistants: {
      retrieve: (assistantId: string) => Promise<any>;
      create: (params: any) => Promise<any>;
      list: () => Promise<any>;
      del: (assistantId: string) => Promise<any>;
    };
    threads: {
      create: (params: any) => Promise<any>;
      retrieve: (threadId: string) => Promise<any>;
      messages: {
        create: (threadId: string, params: any) => Promise<any>;
        list: (threadId: string) => Promise<any>;
      };
      runs: {
        create: (threadId: string, params: any) => Promise<any>;
        retrieve: (threadId: string, runId: string) => Promise<any>;
      };
    };
  };

  constructor(apiKey: string) {
    super(apiKey, 'https://api.openai.com/v1');
    this.beta = {
      assistants: {
        retrieve: async (assistantId: string) => {
          return this.request(`/assistants/${assistantId}`, {
            method: 'GET'
          });
        },
        create: async (params: any) => {
          return this.request('/assistants', {
            method: 'POST',
            body: JSON.stringify(params)
          });
        },
        list: async () => {
          return this.request('/assistants', {
            method: 'GET'
          });
        },
        del: async (assistantId: string) => {
          return this.request(`/assistants/${assistantId}`, {
            method: 'DELETE'
          });
        }
      },
      threads: {
        create: async (params: any) => {
          return this.request('/threads', {
            method: 'POST',
            body: JSON.stringify(params)
          });
        },
        retrieve: async (threadId: string) => {
          return this.request(`/threads/${threadId}`, {
            method: 'GET'
          });
        },
        messages: {
          create: async (threadId: string, params: any) => {
            return this.request(`/threads/${threadId}/messages`, {
              method: 'POST',
              body: JSON.stringify(params)
            });
          },
          list: async (threadId: string) => {
            return this.request(`/threads/${threadId}/messages`, {
              method: 'GET'
            });
          }
        },
        runs: {
          create: async (threadId: string, params: any) => {
            return this.request(`/threads/${threadId}/runs`, {
              method: 'POST',
              body: JSON.stringify(params)
            });
          },
          retrieve: async (threadId: string, runId: string) => {
            return this.request(`/threads/${threadId}/runs/${runId}`, {
              method: 'GET'
            });
          }
        }
      }
    };
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
    signal?: AbortSignal
  ): Promise<ChatCompletionResponse> {
    return this.request<ChatCompletionResponse>('/chat/completions', {
      method: 'POST',
      body: request,
      signal,
    });
  }

  async *streamChatCompletion(
    request: ChatCompletionRequest,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const streamRequest = {
      ...request,
      stream: true,
    };

    for await (const chunk of this.streamRequest<any>('/chat/completions', {
      method: 'POST',
      body: streamRequest,
      signal,
    })) {
      if (!chunk.choices?.[0]?.delta) continue;

      const { content, function_call, tool_calls } = chunk.choices[0].delta;
      const finishReason = chunk.choices[0].finish_reason;

      yield {
        id: chunk.id,
        content: content || '',
        functionCall: function_call,
        toolCalls: tool_calls,
        finishReason,
      };
    }
  }

  async createEmbedding(
    request: EmbeddingRequest,
    signal?: AbortSignal
  ): Promise<EmbeddingResponse> {
    return this.request<EmbeddingResponse>('/embeddings', {
      method: 'POST',
      body: request,
      signal,
    });
  }

  async getModels(signal?: AbortSignal): Promise<Model[]> {
    const response = await this.request<{ data: any[] }>('/models', { signal });
    
    return response.data.map(model => ({
      id: model.id,
      name: model.id,
      provider: 'openai',
      capabilities: [
        'chat',
        'streaming',
        ...(model.id.includes('gpt') ? ['function_calling'] : []),
        ...(model.id.includes('vision') ? ['vision'] : [])
      ] as ModelCapability[],
      tokenCost: 0, // This could be calculated from pricing
      contextWindow: this.getContextWindow(model.id),
      inputFormats: ['text'],
      outputFormats: ['text'],
      streamingSupport: true,
      pricing: this.getPricing(model.id)
    }));
  }

  private getContextWindow(modelId: string): number {
    const windows: Record<string, number> = {
      'gpt-4-turbo-preview': 128000,
      'gpt-4-vision-preview': 128000,
      'gpt-4': 8192,
      'gpt-3.5-turbo': 4096,
      'gpt-3.5-turbo-16k': 16384,
    };

    return windows[modelId] || 4096;
  }

  private getPricing(modelId: string): { prompt: number; completion: number } {
    const pricing: Record<string, { prompt: number; completion: number }> = {
      'gpt-4-turbo-preview': { prompt: 0.01, completion: 0.03 },
      'gpt-4-vision-preview': { prompt: 0.01, completion: 0.03 },
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
      'gpt-3.5-turbo-16k': { prompt: 0.003, completion: 0.004 },
    };

    return pricing[modelId] || { prompt: 0.0015, completion: 0.002 };
  }

  private getRateLimit(modelId: string): { tpm: number; rpm: number } {
    const limits: Record<string, { tpm: number; rpm: number }> = {
      'gpt-4-turbo-preview': { tpm: 300000, rpm: 500 },
      'gpt-4-vision-preview': { tpm: 300000, rpm: 500 },
      'gpt-4': { tpm: 150000, rpm: 500 },
      'gpt-3.5-turbo': { tpm: 180000, rpm: 3500 },
      'gpt-3.5-turbo-16k': { tpm: 180000, rpm: 3500 },
    };

    return limits[modelId] || { tpm: 180000, rpm: 3500 };
  }
}
