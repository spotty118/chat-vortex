import { APIError } from '../errors';
import type { ChatMessage } from '../types';

// Dynamically determine proxy base URL based on environment
const PROXY_BASE = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.host}/api`
  : 'http://localhost:8080/api';

console.log('Using proxy base URL:', PROXY_BASE);

export const fetchCloudflareModels = async (apiKey: string, customUrl?: string) => {
  console.log('Fetching Cloudflare models with proxy base:', PROXY_BASE);
  try {
    // Use the proxy endpoint instead of direct Cloudflare URL
    const endpoint = customUrl?.includes('anthropic') 
      ? '/anthropic/models'
      : '/cloudflare/models';
    
    const response = await fetch(`${PROXY_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare API Error:', errorText);
      
      // For Anthropic through Cloudflare, return predefined models
      if (customUrl && customUrl.includes('anthropic')) {
        return [{
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          capabilities: ["chat", "code", "analysis"]
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          capabilities: ["chat", "code"]
        }];
      }
      
      throw new APIError(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched Cloudflare models:', data);
    
    // If using Anthropic through Cloudflare
    if (customUrl && customUrl.includes('anthropic')) {
      return [{
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        capabilities: ["chat", "code", "analysis"]
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        capabilities: ["chat", "code"]
      }];
    }
    
    // For OpenAI models through Cloudflare
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
    throw error instanceof APIError 
      ? error 
      : new APIError('Failed to fetch models from Cloudflare Gateway');
  }
};

export const sendCloudflareMessage = async (
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
  customUrl?: string
) => {
  console.log('Sending message through proxy...', { 
    modelId, 
    messageCount: messages.length,
    proxyBase: PROXY_BASE,
    customUrl
  });
  
  try {
    // Use the proxy endpoint instead of direct Cloudflare URL
    const endpoint = customUrl?.includes('anthropic') 
      ? '/anthropic/messages'
      : '/cloudflare/chat/completions';
    
    const response = await fetch(`${PROXY_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify(
        modelId.includes('claude')
          ? {
              model: modelId,
              messages: messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
              })),
              stream: false
            }
          : {
              model: modelId,
              messages: messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
              })),
              stream: false
            }
      )
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare API Error:', errorText);
      throw new APIError(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Proxy Response:', JSON.stringify(data, null, 2));

    // Handle different response formats for different providers
    if (modelId.includes('claude')) {
      return {
        message: data.content[0].text,
        role: 'assistant',
        usage: data.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
    }

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
    console.error('Error sending message via proxy:', error);
    throw error instanceof APIError 
      ? error 
      : new APIError('Failed to send message through proxy');
  }
};