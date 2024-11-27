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
    
    // Transform the models data to match our expected format
    const transformedModels = (data.data || []).map((model: any) => ({
      id: model.id,
      name: model.name || model.id,
      pricing: {
        prompt: model.pricing?.prompt,
        completion: model.pricing?.completion
      }
    }));

    return transformedModels;
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    throw error instanceof APIError ? error : new APIError('Failed to fetch models');
  }
};

export const sendOpenRouterMessage = async (
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
) => {
  console.log('Sending message to OpenRouter...', { modelId, messages });
  try {
    // Format messages according to OpenRouter's expected format
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "AI Chat Interface"
      },
      body: JSON.stringify({
        model: modelId,
        messages: formattedMessages
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error Response:', errorText);
      throw new APIError(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenRouter API Response:', JSON.stringify(data, null, 2));

    // Handle different response formats
    let content = '';
    if (data.choices?.[0]?.message?.content) {
      content = data.choices[0].message.content;
    } else if (data.choices?.[0]?.content) {
      content = data.choices[0].content;
    } else if (typeof data.choices?.[0]?.text === 'string') {
      content = data.choices[0].text;
    } else {
      console.error('Unexpected response format from OpenRouter:', JSON.stringify(data, null, 2));
      throw new APIError('Invalid response format from OpenRouter');
    }

    return {
      message: content,
      usage: data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
  } catch (error) {
    console.error('Error sending message to OpenRouter:', error);
    throw error instanceof APIError ? error : new APIError('Failed to send message');
  }
};