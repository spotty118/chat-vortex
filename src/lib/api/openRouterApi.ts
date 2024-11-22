import { APIError } from '../errors';
import type { ChatMessage } from '../types';

export const fetchOpenRouterModels = async (apiKey: string) => {
  console.log('Fetching OpenRouter models...');
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      }
    });

    if (!response.ok) {
      console.error('OpenRouter API Error:', await response.text());
      throw new APIError(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched OpenRouter models:', data);
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    throw error instanceof APIError ? error : new APIError('Failed to fetch models');
  }
};

export const sendOpenRouterMessage = async (
  apiKey: string,
  modelId: string,
  messages: ChatMessage[]
) => {
  console.log('Sending message to OpenRouter...', { modelId, messages });
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "AI Chat Interface"
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error Response:', errorText);
      throw new APIError(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenRouter API Response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response format from OpenRouter:', data);
      throw new APIError('Invalid response format from OpenRouter');
    }

    return {
      message: data.choices[0].message.content,
      usage: data.usage || null
    };
  } catch (error) {
    console.error('Error sending message to OpenRouter:', error);
    throw error instanceof APIError ? error : new APIError('Failed to send message');
  }
};