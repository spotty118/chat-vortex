export const config = {
  runtime: 'edge',
};

// Update CORS headers to allow the deployed domain
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://preview--chat-vortex.lovable.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Provider, X-Model-ID',
};

const GATEWAY_BASE = 'https://gateway.ai.cloudflare.com/v1/fe45775498a97cb07c10d3f0d79cc2f0/big';

const PROVIDER_ENDPOINTS = {
  google: `${GATEWAY_BASE}/google-ai-studio/v1beta/models`,
  cloudflare: `${GATEWAY_BASE}/cloudflare/@cf/meta/llama-2-7b-chat-int8`,
  openai: `${GATEWAY_BASE}/openai/models`,
};

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const provider = req.headers.get('X-Provider');
  const apiKey = req.headers.get('Authorization')?.split('Bearer ')[1];
  
  if (!apiKey) {
    return new Response('API key is required', { 
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    const gatewayUrl = PROVIDER_ENDPOINTS[provider];
    if (!gatewayUrl) {
      return new Response(`Unsupported provider: ${provider}`, {
        status: 400,
        headers: corsHeaders
      });
    }

    // Forward the request to Cloudflare Gateway
    const response = await fetch(gatewayUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? await req.text() : undefined,
    });

    const data = await response.json();

    // For Cloudflare provider, format the response to match the expected structure
    if (provider === 'cloudflare') {
      const formattedData = {
        models: [{
          id: 'llama-2-7b-chat-int8',
          name: 'Llama 2 7B Chat (INT8)',
          provider: 'cloudflare'
        }]
      };
      return new Response(JSON.stringify(formattedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
