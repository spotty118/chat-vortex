import { Provider } from './types';

export async function fetchModels(provider: Provider | null) {
  if (!provider) {
    throw new Error('Provider is required');
  }

  const apiKey = localStorage.getItem('apiKey');
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const response = await fetch('/api/models', {
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

  return response.json();
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}
