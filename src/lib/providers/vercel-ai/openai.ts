import { OpenAIStream } from 'ai';
import { BaseVercelProvider, ProviderStreamOptions } from './base';

export class VercelOpenAIProvider extends BaseVercelProvider {
  protected async generateStream({ apiKey, model, messages, signal }: ProviderStreamOptions) {
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: true,
      }),
      signal,
    });
  }

  async streamResponse(options: ProviderStreamOptions) {
    const response = await this.generateStream(options);
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  }
}