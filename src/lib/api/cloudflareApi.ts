import { APIError } from '../errors';
import type { ChatMessage } from '../types';

// Update proxy base URL to match server port
const PROXY_BASE = 'http://localhost:8080/api/cloudflare';
const CLOUDFLARE_PATH = '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/openai';

export const fetchCloudflareModels = async (apiKey: string, customUrl?: string) => {
  console.log('Fetching Cloudflare models with proxy base:', PROXY_BASE);
  try {
    const baseUrl = customUrl || `${PROXY_BASE}${CLOUDFLARE_PATH}`;
    const response = await fetch(`${baseUrl}/models`, {
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
      
      // For Google Vertex AI, return predefined models
      if (customUrl && customUrl.includes('google-vertex')) {
        return [{
          id: 'chat-bison',
          name: 'Google Vertex AI - Chat-Bison',
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
    
    // If using Google Vertex AI through Cloudflare
    if (customUrl && customUrl.includes('google-vertex')) {
      return [{
        id: 'chat-bison',
        name: 'Google Vertex AI - Chat-Bison',
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
    
    // Return appropriate fallback models based on the URL
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
    
    if (customUrl && customUrl.includes('google-vertex')) {
      return [{
        id: 'chat-bison',
        name: 'Google Vertex AI - Chat-Bison',
        capabilities: ["chat", "code"]
      }];
    }
    
    // Default OpenAI models
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
  signal?: AbortSignal,
  customUrl?: string
) => {
  console.log('Sending message to Cloudflare AI Gateway...', { 
    modelId, 
    messageCount: messages.length,
    proxyBase: PROXY_BASE,
    customUrl
  });
  
  try {
    const baseUrl = customUrl || `${PROXY_BASE}${CLOUDFLARE_PATH}`;
    const endpoint = modelId.includes('claude') ? 'messages' : 'chat/completions';
    
    const response = await fetch(`${baseUrl}/${endpoint}`, {
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
    console.log('Cloudflare API Response:', JSON.stringify(data, null, 2));

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
    console.error('Error sending message via Cloudflare:', error);
    throw error instanceof APIError 
      ? error 
      : new APIError('Failed to send message to Cloudflare Gateway. Please ensure CORS is enabled in your Workers settings.');
  }
};