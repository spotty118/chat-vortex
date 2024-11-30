import { APIError } from '../errors';
import type { ChatMessage } from '../types';

// Get the base URL from environment or default to localhost in development
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://preview--chat-vortex.lovable.app/api/google'
  : 'http://localhost:8081/api/google';

// Default models in case API fetch fails
const DEFAULT_MODELS = [
  {
    id: 'gemini-1.5-pro',
    baseModelId: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    capabilities: ["chat", "code"],
    contextLength: 32000,
    inputPrice: 0.00001,
    outputPrice: 0.00002
  },
  {
    id: 'gemini-1.5-pro-vision',
    baseModelId: 'gemini-1.5-pro-vision',
    name: 'Gemini 1.5 Pro Vision',
    capabilities: ["chat", "code", "vision"],
    contextLength: 32000,
    inputPrice: 0.00001,
    outputPrice: 0.00002
  }
];

export const fetchGoogleModels = async (apiKey: string, customApiUrl?: string) => {
  if (!apiKey) {
    throw new APIError("Google API key is required");
  }

  try {
    const baseUrl = customApiUrl || API_BASE;
    console.log('Fetching models from:', baseUrl);

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      }
    });

    if (!response.ok) {
      console.warn('Failed to fetch models from API, using defaults');
      return DEFAULT_MODELS;
    }

    try {
      const data = await response.json();
      console.log('Models response:', data);
      return DEFAULT_MODELS;
    } catch (error) {
      console.warn('Error parsing models response:', error);
      return DEFAULT_MODELS;
    }
  } catch (error) {
    console.warn('Network error fetching models:', error);
    return DEFAULT_MODELS;
  }
};

export const sendGoogleMessage = async (
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
  customApiUrl?: string
) => {
  if (!apiKey) {
    throw new APIError("Google API key is required");
  }

  try {
    const baseUrl = customApiUrl || API_BASE;
    console.log('Sending message to:', baseUrl);

    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content.toString() }]
    }));

    const requestBody = {
      contents: formattedMessages,
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    };

    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'x-goog-api-key': 'REDACTED',
      'x-model-id': modelId
    });

    const response = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'x-model-id': modelId
      },
      body: JSON.stringify(requestBody),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`Failed to generate content: ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    console.log('Chat response:', data);

    const content = data.candidates?.[0]?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    return {
      message: content.parts?.[0]?.text || '',
      usage: {},
      metadata: {
        model: modelId,
        provider: 'google',
        processingTime: null,
      }
    };
  } catch (error) {
    console.error('Google AI Studio Error:', {
      error,
      message: error.message,
      stack: error.stack
    });
    throw new APIError(`Failed to send message: ${error.message}`);
  }
};