import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';
import { BaseVercelProvider, ProviderStreamOptions } from './base';

export class VercelGoogleProvider extends BaseVercelProvider {
  protected async generateStream({ apiKey, model, messages, signal }: ProviderStreamOptions) {
    console.log('Generating stream for model:', model);
    const baseUrl = 'http://localhost:8080/api/google';
    const modelId = model.split('/').pop(); // Get the last part of the model path
    
    const endpoint = `${baseUrl}/v1beta/models/${modelId}/generateContent`;
    console.log('Making request to:', endpoint);
    
    try {
      const response = await fetch(endpoint, {
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

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || response.statusText);
      }

      return response;
    } catch (error) {
      console.error('Error in generateStream:', error);
      throw error;
    }
  }

  async streamResponse(options: ProviderStreamOptions) {
    try {
      const response = await this.generateStream(options);
      const stream = GoogleGenerativeAIStream({
        stream: response.body as unknown as AsyncIterable<any>
      });
      return new StreamingTextResponse(stream);
    } catch (error) {
      console.error('Error in streamResponse:', error);
      throw error;
    }
  }
}