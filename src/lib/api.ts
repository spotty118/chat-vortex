import { Provider } from './types';
import { MessageWithMetadata } from './types/ai';

function getApiKey(provider: Provider) {
  const apiKey = localStorage.getItem(`${provider.id}-apiKey`);
  if (!apiKey) {
    throw new Error(`API key for ${provider.name} is required`);
  }
  return apiKey;
}

export async function fetchModels(provider: Provider | null) {
  if (!provider) {
    throw new Error('Provider is required');
  }

  const apiKey = getApiKey(provider);

  try {
    const response = await fetch('/api/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Provider': provider.id,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Failed to fetch models: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

export async function sendMessage(
  provider: Provider,
  modelId: string,
  messages: MessageWithMetadata[],
  signal?: AbortSignal
) {
  const apiKey = getApiKey(provider);

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'X-Provider': provider.id,
      'X-Model-ID': modelId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Failed to send message: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    message: data.choices?.[0]?.message?.content || '',
    id: data.id,
    usage: data.usage,
    metadata: data.metadata,
  };
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}
