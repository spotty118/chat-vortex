import { APIError } from '../errors';
import type { ChatMessage } from '../types';

export const fetchCloudflareModels = async (apiKey: string) => {
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
  const gatewayUrl = localStorage.getItem('cloudflare_gateway_url');
  if (!gatewayUrl) {
    throw new APIError('Cloudflare AI Gateway URL not configured');
  }

  console.log('Sending message via Cloudflare AI Gateway...', { modelId, gatewayUrl });
  
  try {
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // Add CORS headers
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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
      console.error('Cloudflare Gateway Error:', errorText);
      throw new APIError(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Cloudflare Gateway Response:', data);

    return {
      message: data.choices[0].message.content,
      usage: data.usage
    };
  } catch (error) {
    console.error('Error sending message via Cloudflare:', error);
    throw error instanceof APIError ? error : new APIError('Failed to send message');
  }
};