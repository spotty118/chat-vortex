import { Provider } from './types';

export async function fetchModels(provider: Provider | null) {
  if (!provider) {
    throw new Error('Provider is required');
  }

  const response = await fetch('/api/models', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
      'X-Provider': provider.id,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  return response.json();
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}
