import { AnthropicStream, StreamingTextResponse } from 'ai';
import { BaseVercelProvider, ProviderStreamOptions } from './base';

export class VercelAnthropicProvider extends BaseVercelProvider {
  protected async generateStream({ apiKey, model, messages, signal }: ProviderStreamOptions) {
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages: messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        stream: true,
      }),
      signal,
    });
  }

  async streamResponse(options: ProviderStreamOptions) {
    const response = await this.generateStream(options);
    const stream = AnthropicStream(response);
    return new StreamingTextResponse(stream);
  }
}