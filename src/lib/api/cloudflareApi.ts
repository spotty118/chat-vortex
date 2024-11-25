import { APIError } from '../errors';
import type { ChatMessage } from '../types';

const PROXY_BASE = 'http://localhost:3001/api/cloudflare';
const CLOUDFLARE_PATH = '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/openai';

export const fetchCloudflareModels = async (apiKey: string) => {
  try {
    const response = await fetch(`${PROXY_BASE}${CLOUDFLARE_PATH}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new APIError(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filter for chat models and map to our format
    const chatModels = data.data
      .filter((model: any) => model.id.includes('gpt'))
      .map((model: any) => ({
        id: model.id,
        name: model.id.split('-').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        capabilities: ["chat", "code"],
        ...(model.id.includes('gpt-4') && { capabilities: ["chat", "code", "analysis"] })
      }));

    return chatModels;
  } catch (error) {
    console.error('Error fetching Cloudflare models:', error);
    // Fallback to default models if fetch fails
    return [
      {
        id: "gpt-4",
        name: "GPT-4",
        capabilities: ["chat", "code", "analysis"],
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        capabilities: ["chat", "code"],
      }
    ];
  }
};

export const sendCloudflareMessage = async (
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  signal?: AbortSignal
) => {
  console.log('Sending message to Cloudflare AI Gateway...', { 
    modelId, 
    messageCount: messages.length 
  });
  
  try {
    const response = await fetch(`${PROXY_BASE}${CLOUDFLARE_PATH}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model: modelId,
        messages: messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare API Error:', errorText);
      throw new APIError(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Cloudflare API Response:', JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message) {
      throw new APIError('Invalid response format from Cloudflare');
    }

    return {
      message: data.choices[0].message.content,
      role: 'assistant',
      usage: data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
  } catch (error) {
    console.error('Error sending message via Cloudflare:', error);
    throw error instanceof APIError 
      ? error 
      : new APIError('Failed to send message to Cloudflare Gateway. Please ensure CORS is enabled in your Workers settings.');
  }
};