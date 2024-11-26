import {
  ChatMessage,
  ChatCompletionRequest,
  StreamChunk,
} from '@/lib/types/ai';
import {
  Model,
  Provider,
} from '@/lib/types/models';
import { Tool } from '@/lib/types/tools';
import { OpenAIClient } from '@/lib/api/openai';
import { AnthropicClient } from '@/lib/api/anthropic';

export class ChatService {
  private clients: Map<string, OpenAIClient | AnthropicClient>;
  private activeModels: Map<string, Model>;
  private tools: Map<string, Tool>;

  constructor() {
    this.clients = new Map();
    this.activeModels = new Map();
    this.tools = new Map();
  }

  registerProvider(provider: Provider): void {
    switch (provider.id) {
      case 'openai':
        this.clients.set(provider.id, new OpenAIClient(provider.apiKey));
        break;
      case 'anthropic':
        this.clients.set(provider.id, new AnthropicClient(provider.apiKey));
        break;
      default:
        throw new Error(`Unsupported provider: ${provider.id}`);
    }
  }

  registerModel(model: Model): void {
    this.activeModels.set(model.id, model);
  }

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  async getModels(): Promise<Model[]> {
    const models: Model[] = [];
    for (const client of this.clients.values()) {
      try {
        const providerModels = await client.getModels();
        models.push(...providerModels);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    }
    return models;
  }

  async chat(
    messages: ChatMessage[],
    model: Model,
    options: {
      stream?: boolean;
      temperature?: number;
      max_tokens?: number;
      tools?: string[];
      signal?: AbortSignal;
    } = {}
  ): Promise<ChatMessage | AsyncGenerator<StreamChunk, void, unknown>> {
    const client = this.clients.get(model.provider);
    if (!client) {
      throw new Error(`Provider ${model.provider} not configured`);
    }

    const startTime = Date.now();
    const request: ChatCompletionRequest = {
      model: model.id,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        name: msg.name,
        id: msg.id || crypto.randomUUID(), // Add a unique ID if not provided
        timestamp: msg.timestamp || Date.now(), // Add current timestamp if not provided
      })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
      tools: options.tools?.map(toolName => {
        const tool = this.tools.get(toolName);
        if (!tool) {
          throw new Error(`Tool ${toolName} not found`);
        }
        return {
          type: 'function' as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        };
      }),
    };

    if (options.stream) {
      return client.streamChatCompletion(request, options.signal);
    }

    const response = await client.createChatCompletion(request, options.signal);
    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls?.map(call => ({
      name: call.function.name,
      arguments: JSON.parse(call.function.arguments),
    }));

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: choice.message.content || '',
      timestamp: Date.now(),
      metadata: {
        toolCalls,
        model: model.id,
        provider: model.provider,
        tokens: response.usage?.completion_tokens,
        processingTime: Date.now() - startTime,
      },
    };
  }

  async streamChat(
    messages: ChatMessage[],
    model: Model,
    options: {
      max_tokens?: number;
      temperature?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<AsyncGenerator<StreamChunk, void, unknown>> {
    const client = this.clients.get(model.provider);
    if (!client) {
      throw new Error(`No client found for provider: ${model.provider}`);
    }

    const request: ChatCompletionRequest = {
      model: model.id,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        name: msg.name,
        id: msg.id || crypto.randomUUID(), // Add a unique ID if not provided
        timestamp: msg.timestamp || Date.now(), // Add current timestamp if not provided
      })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
    };

    return client.streamChatCompletion(request, options.signal);
  }

  async parallel(
    messages: ChatMessage[],
    models: Model[],
    options: {
      temperature?: number;
      max_tokens?: number;
      tools?: string[];
      signal?: AbortSignal;
    } = {}
  ): Promise<Map<string, ChatMessage>> {
    const results = new Map<string, ChatMessage>();
    const promises = models.map(async model => {
      try {
        const response = await this.chat(messages, model, options);
        
        if (isChatMessage(response)) {
          results.set(model.id, response);
        } else if (isAsyncGenerator(response)) {
          throw new Error('Streaming not supported in parallel mode');
        } else {
          throw new Error('Unexpected response type');
        }
      } catch (error) {
        console.error(`Error with model ${model.id}:`, error);
        results.set(model.id, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now(),
          metadata: {
            model: model.id,
            provider: model.provider,
            error: true,
            processingTime: 0,
          },
        });
      }
    });

    await Promise.all(promises);
    return results;
  }
}

function isChatMessage(obj: any): obj is ChatMessage {
  return (
    obj &&
    typeof obj === 'object' &&
    'role' in obj &&
    'content' in obj &&
    'id' in obj &&
    'timestamp' in obj
  );
}

function isAsyncGenerator(obj: any): obj is AsyncGenerator<StreamChunk, void, unknown> {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj[Symbol.asyncIterator] === 'function' &&
    typeof obj.next === 'function' &&
    typeof obj.return === 'function' &&
    typeof obj.throw === 'function'
  );
}
