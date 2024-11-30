import { AIStream, StreamingTextResponse } from 'ai';
import type { ChatMessage } from '@/lib/types';

export type ProviderStreamOptions = {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
};

export abstract class BaseVercelProvider {
  protected abstract generateStream(options: ProviderStreamOptions): Promise<Response>;
  
  async streamResponse(options: ProviderStreamOptions) {
    try {
      const response = await this.generateStream(options);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || response.statusText);
      }
      
      const stream = AIStream(response);
      return new StreamingTextResponse(stream);
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }
}