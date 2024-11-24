import { APIError } from '../errors';
import type { ChatMessage } from '../types';

export const fetchCloudflareModels = async (apiKey: string) => {
  console.log('Fetching Cloudflare models...');
  // Cloudflare uses OpenAI's models, so we return them directly
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
};

export const sendCloudflareMessage = async (
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  signal?: AbortSignal
) => {
  const WORKER_URL = 'https://ai-gateway-cors.spotty118.workers.dev/';
  
  console.log('Sending message via Cloudflare Worker...', { 
    modelId,
    workerUrl: WORKER_URL,
    messageCount: messages.length 
  });
  
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal,
      body: JSON.stringify({
        model: modelId,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare Worker Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      throw new APIError(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Cloudflare Worker Response:', {
      status: response.status,
      hasChoices: !!data.choices,
      messageLength: data.choices?.[0]?.message?.content?.length
    });

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid response format from Cloudflare:', data);
      throw new APIError('Invalid response format from Cloudflare Worker');
    }

    return {
      message: data.choices[0].message.content,
      usage: data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
  } catch (error) {
    console.error('Error sending message via Cloudflare:', error);
    throw error instanceof APIError ? error : new APIError('Failed to send message to Cloudflare Worker');
  }
};