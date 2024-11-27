import { APIError, RequestOptions } from '@/lib/types/ai';

export abstract class BaseAPIClient {
  protected apiKey: string;
  protected baseURL: string;
  protected defaultHeaders: Record<string, string>;
  protected maxRetries: number;
  protected retryDelay: number;

  constructor(apiKey: string, baseURL: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  protected async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const {
        method = 'GET',
        headers = {},
        body,
        signal,
        timeout = 30000,
      } = options;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method,
          headers: {
            ...this.defaultHeaders,
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: signal || controller.signal,
        });

        clearTimeout(timeoutId);

        // Check if response is HTML (indicating a CDN error page)
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/html')) {
          throw new Error('Received HTML response instead of JSON. This usually indicates a CDN or gateway error.');
        }

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new APIError({
            status: response.status,
            message: error.message || response.statusText,
            code: error.code,
            details: error.details,
          });
        }

        return response.json();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if it's a user abort
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }
        
        // Don't retry on 4xx errors (client errors)
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // On last attempt, throw the error
        if (attempt === this.maxRetries - 1) {
          console.error(`Failed after ${this.maxRetries} attempts:`, error);
          throw error;
        }
        
        console.warn(`Attempt ${attempt + 1} failed, retrying:`, error);
        continue;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError || new Error('Request failed');
  }

  protected async *streamRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): AsyncGenerator<T, void, unknown> {
    const {
      method = 'GET',
      headers = {},
      body,
      signal,
      timeout = 30000,
    } = options;

    let retryCount = 0;
    const maxRetries = this.maxRetries;

    while (retryCount <= maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

      try {
        if (retryCount > 0) {
          const delay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method,
          headers: {
            ...this.defaultHeaders,
            ...headers,
            'Accept': 'text/event-stream',
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: signal || controller.signal,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new APIError({
            status: response.status,
            message: error.message || response.statusText,
            code: error.code,
            details: error.details,
          });
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            if (buffer.trim()) {
              try {
                const data = JSON.parse(buffer.trim().replace(/^data: /, ''));
                yield data;
              } catch (e) {
                console.warn('Failed to parse final chunk:', e);
              }
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

            // Handle different SSE formats
            const dataLine = trimmedLine.startsWith('data: ') 
              ? trimmedLine.slice(6) 
              : trimmedLine;

            try {
              const data = JSON.parse(dataLine);
              yield data;
            } catch (e) {
              console.warn('Failed to parse streaming response line:', e);
              continue;
            }
          }
        }

        // Successful stream completion
        return;

      } catch (error) {
        if (error instanceof Error) {
          // Don't retry on user abort or client errors
          if (error.name === 'AbortError' || 
              (error instanceof APIError && error.status >= 400 && error.status < 500)) {
            throw error;
          }

          // Retry on network errors or server errors
          if (retryCount < maxRetries) {
            console.warn(`Attempt ${retryCount + 1} failed, retrying:`, error);
            retryCount++;
            continue;
          }
        }

        throw new APIError({
          message: error instanceof Error ? error.message : 'Stream request failed',
          status: error instanceof APIError ? error.status : undefined,
        });

      } finally {
        clearTimeout(timeoutId);
        if (reader) {
          try {
            await reader.cancel();
            reader.releaseLock();
          } catch (e) {
            console.warn('Error releasing reader lock:', e);
          }
        }
      }
    }
  }

  protected async handleRateLimit(response: Response): Promise<void> {
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');
    
    if (rateLimitRemaining && parseInt(rateLimitRemaining) <= 1) {
      const resetTime = rateLimitReset ? parseInt(rateLimitReset) * 1000 : Date.now() + 60000;
      const waitTime = Math.max(0, resetTime - Date.now());
      
      if (waitTime > 0) {
        console.warn(`Rate limit nearly exceeded. Waiting ${waitTime}ms before next request`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}
