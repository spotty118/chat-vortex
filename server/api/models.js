export const config = {
  runtime: 'edge',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Provider, X-Model-ID',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const provider = req.headers.get('X-Provider');
  const apiKey = req.headers.get('Authorization')?.split('Bearer ')[1];
  
  if (!apiKey) {
    return new Response('API key is required', { 
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    const gatewayUrl = provider === 'google' 
      ? 'https://gateway.ai.cloudflare.com/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/google-ai-studio/v1beta/models'
      : 'https://gateway.ai.cloudflare.com/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/openai/models';

    const response = await fetch(gatewayUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
