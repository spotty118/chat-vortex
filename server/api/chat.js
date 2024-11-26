import { StreamingTextResponse, OpenAIStream } from 'ai';
import OpenAI from 'openai';

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
    let gatewayUrl;
    
    // Handle different provider endpoints
    if (provider === 'google') {
      gatewayUrl = `${GATEWAY_BASE}/google-ai-studio`;
    } else if (provider === 'openai') {
      gatewayUrl = `${GATEWAY_BASE}/openai`;
    } else {
      return new Response(`Unsupported provider: ${provider}`, {
        status: 400,
        headers: corsHeaders
      });
    }

    // Forward the request to Cloudflare
    const response = await fetch(`${gatewayUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: await req.text(),
    });

    const data = await response.json();

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
