import { BaseAPIClient } from './base';
import {
  ChatMessage,
  ChatCompletionRequest,
  StreamChunk,
  APIError,
} from '@/lib/types/ai';
import { Tool } from '@/lib/types/tools';
import { Model, ModelCapability, ContentFormat } from '@/lib/types';

export class AnthropicClient extends BaseAPIClient {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.anthropic.com/v1');
    this.defaultHeaders['anthropic-version'] = '2023-06-01';
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
    signal?: AbortSignal
  ): Promise<any> {
    const anthropicRequest = this.transformRequest(request);
    const response = await this.request<any>('/messages', {
      method: 'POST',
      body: anthropicRequest,
      signal,
    });

    return this.transformResponse(response);
  }

  async *streamChatCompletion(
    request: ChatCompletionRequest,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const anthropicRequest = {
      ...this.transformRequest(request),
      stream: true,
    };

    for await (const chunk of this.streamRequest<any>('/messages', {
      method: 'POST',
      body: anthropicRequest,
      signal,
    })) {
      if (!chunk.type || chunk.type !== 'content_block_delta') continue;

      yield {
        id: chunk.message_id,
        content: chunk.delta?.text || '',
        finishReason: chunk.usage?.finish_reason,
      };
    }
  }

  async getModels(signal?: AbortSignal): Promise<Model[]> {
    // Anthropic doesn't have a models endpoint, so we hardcode the available models
    const models = [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        contextWindow: 200000,
        pricing: { prompt: 0.015, completion: 0.075 },
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        contextWindow: 200000,
        pricing: { prompt: 0.003, completion: 0.015 },
      },
      {
        id: 'claude-2.1',
        name: 'Claude 2.1',
        contextWindow: 200000,
        pricing: { prompt: 0.008, completion: 0.024 },
      },
    ];

    return models.map(model => ({
      ...model,
      provider: 'anthropic',
      capabilities: [
        'chat' as ModelCapability,
        model.id.includes('claude-3') ? 'vision' as ModelCapability : null,
        'streaming' as ModelCapability,
        'function_calling' as ModelCapability
      ].filter(Boolean) as ModelCapability[],
      tokenCost: model.pricing.prompt, // Use prompt pricing as token cost
      inputFormats: ['text' as ContentFormat], // Changed to only use 'text'
      outputFormats: ['text' as ContentFormat], // Changed to only use 'text'
      streamingSupport: true,
      rateLimit: {
        tpm: 450000,
        rpm: 500,
      },
    }));
  }

  private transformRequest(request: ChatCompletionRequest): any {
    const systemMessage = request.messages.find(msg => msg.role === 'system');
    const nonSystemMessages = request.messages.filter(msg => msg.role !== 'system');

    const messages = nonSystemMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    return {
      model: request.model,
      messages,
      system: systemMessage?.content,
      max_tokens: request.max_tokens,
      temperature: request.temperature,
      stream: request.stream,
      tools: request.tools?.map(tool => ({
        type: 'function',
        function: {
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
        },
      })),
    };
  }

  private transformResponse(response: any): any {
    if (!response?.content?.[0]) {
      throw new APIError({
        message: 'Invalid response format from Anthropic API',
        status: 500,
      });
    }

    const message = response.content[0];
    const toolCalls = message.tool_calls?.map((call: any) => {
      try {
        return {
          id: call.id || crypto.randomUUID(),
          type: 'function',
          function: {
            name: call.function.name,
            arguments: typeof call.function.arguments === 'string' 
              ? call.function.arguments 
              : JSON.stringify(call.function.arguments),
          },
        };
      } catch (e) {
        console.warn('Error processing tool call:', e);
        return null;
      }
    }).filter(Boolean);

    return {
      id: response.id || crypto.randomUUID(),
      object: 'chat.completion',
      created: Date.now(),
      model: response.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: message.text,
            tool_calls: toolCalls,
          },
          finish_reason: response.stop_reason || 'stop',
        },
      ],
      usage: response.usage && {
        prompt_tokens: response.usage.input_tokens || 0,
        completion_tokens: response.usage.output_tokens || 0,
        total_tokens: (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0),
      },
    };
  }
}
