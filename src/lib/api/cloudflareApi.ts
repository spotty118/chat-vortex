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

  console.log('Sending message via Cloudflare AI Gateway...', { 
    modelId, 
    gatewayUrl: gatewayUrl.replace(/\/[^/]*$/, '/*'), // Log URL with ID masked
    messageCount: messages.length 
  });
  
  try {
    const response = await fetch(gatewayUrl, {
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
      console.error('Cloudflare Gateway Error Response:', errorText);
      
      if (response.status === 403) {
        throw new APIError('Access denied. Please check your API key and ensure CORS is enabled in your Cloudflare Workers settings.');
      }
      
      throw new APIError(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Cloudflare Gateway Response:', {
      status: response.status,
      hasChoices: !!data.choices,
      messageLength: data.choices?.[0]?.message?.content?.length
    });

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid response format from Cloudflare:', data);
      throw new APIError('Invalid response format from Cloudflare Gateway');
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
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to send message to Cloudflare Gateway. Please ensure CORS is enabled in your Workers settings.');
  }
};