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

export default async function POST(req) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { messages } = await req.json();
  const apiKey = req.headers.get('Authorization')?.split('Bearer ')[1];
  const provider = req.headers.get('X-Provider');
  const modelId = req.headers.get('X-Model-ID');

  if (!apiKey) {
    return new Response('API key is required', { 
      status: 401,
      headers: corsHeaders
    });
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const response = await openai.chat.completions.create({
      model: modelId || 'gpt-3.5-turbo',
      stream: true,
      messages: messages.map((message) => ({
        content: message.content,
        role: message.role,
      })),
    });

    // Create a stream using Vercel AI SDK
    const stream = OpenAIStream(response);
    
    // Return a StreamingTextResponse with CORS headers
    return new StreamingTextResponse(stream, { headers: corsHeaders });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
