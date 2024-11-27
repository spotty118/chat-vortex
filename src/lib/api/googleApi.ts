import { APIError } from '../errors';
import type { ChatMessage } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Base URL for the proxy server
const API_BASE = 'http://localhost:8080/api/google';

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
    const response = await fetch(`${baseUrl}/v1beta/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google AI API Error:', errorData);
      throw new APIError(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Available Google AI models:', data);

    // Transform the models into our format
    const transformedModels = data.models
      .filter(model => {
        const modelName = model.name.toLowerCase();
        return modelName.includes('gemini');
      })
      .map(model => ({
        id: model.name,
        baseModelId: model.baseModelId,
        name: model.displayName || model.baseModelId,
        description: model.description,
        capabilities: ["chat", "code"],
        contextLength: model.inputTokenLimit,
        inputPrice: 0.00001,
        outputPrice: 0.00002,
        temperature: model.temperature,
        maxTemperature: model.maxTemperature,
        supportedMethods: model.supportedGenerationMethods || []
      }));

    return transformedModels;
  } catch (error) {
    console.error('Error fetching Google AI models:', error);
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
    const baseModelId = modelId.includes('models/') ? modelId.split('/')[1] : modelId;

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

    const response = await fetch(`${baseUrl}/v1beta/models/${baseModelId}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(requestBody),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Failed to generate content: ${errorData?.error?.message || response.statusText}`);
    }

    const data = await response.json();
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
    console.error('Google AI Studio Error:', error);
    throw new APIError(`Failed to send message: ${error.message}`);
  }
};

export class GoogleClient {
  constructor(private apiKey: string) {}

  public async exampleMethod() {
    console.log('Example method called');
  }
}