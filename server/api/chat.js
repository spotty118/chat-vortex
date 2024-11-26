import { StreamingTextResponse } from 'ai';

export const config = {
  runtime: 'edge',
};

// Add CORS headers to all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Provider, X-Model-ID',
};

const GATEWAY_BASE = 'https://gateway.ai.cloudflare.com/v1/fe45775498a97cb07c10d3f0d79cc2f0/big';

const PROVIDER_ENDPOINTS = {
  google: (modelId) => `${GATEWAY_BASE}/google-ai-studio/v1beta/models/${modelId}:generateContent`,
  cloudflare: (modelId) => `${GATEWAY_BASE}/cloudflare/@cf/meta/${modelId}`,
  openai: (modelId) => `${GATEWAY_BASE}/openai/chat/completions`,
};

export default async function POST(req) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const provider = req.headers.get('X-Provider');
  const modelId = req.headers.get('X-Model-ID');
  const apiKey = req.headers.get('Authorization')?.split('Bearer ')[1];

  if (!apiKey) {
    return new Response('API key is required', { 
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    const getEndpoint = PROVIDER_ENDPOINTS[provider];
    if (!getEndpoint) {
      return new Response(`Unsupported provider: ${provider}`, {
        status: 400,
        headers: corsHeaders
      });
    }

    const gatewayUrl = getEndpoint(modelId);
    const body = await req.json();

    // Format the request body based on the provider
    let formattedBody;
    if (provider === 'google') {
      formattedBody = {
        contents: body.messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }))
      };
    } else if (provider === 'cloudflare') {
      formattedBody = {
        messages: body.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };
    } else {
      formattedBody = body;
    }

    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedBody),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(error, {
        status: response.status,
        headers: corsHeaders
      });
    }

    const data = await response.json();

    // Format the response based on the provider
    let formattedResponse;
    if (provider === 'google') {
      formattedResponse = {
        choices: [{
          message: {
            content: data.candidates[0].content.parts[0].text
          }
        }],
        usage: data.usage
      };
    } else if (provider === 'cloudflare') {
      formattedResponse = {
        choices: [{
          message: {
            content: data.response
          }
        }]
      };
    } else {
      formattedResponse = data;
    }

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
