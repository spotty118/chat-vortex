import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';
import { BaseVercelProvider, ProviderStreamOptions } from './base';

export class VercelGoogleProvider extends BaseVercelProvider {
  protected async generateStream({ apiKey, model, messages, signal }: ProviderStreamOptions) {
    const baseUrl = 'http://localhost:8080/api/google';
    return fetch(`${baseUrl}/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content.toString() }]
        })),
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        }
      }),
      signal,
    });
  }

  async streamResponse(options: ProviderStreamOptions) {
    const response = await this.generateStream(options);
    // Convert Response to the expected format for GoogleGenerativeAIStream
    const stream = GoogleGenerativeAIStream({
      stream: response.body as unknown as AsyncIterable<any>,
      async: true
    });
    return new StreamingTextResponse(stream);
  }
}