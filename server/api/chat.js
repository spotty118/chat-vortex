import { StreamingTextResponse, LangChainStream } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatAnthropic } from '@langchain/anthropic';
import { AIMessage, HumanMessage } from '@langchain/core/messages';

export const config = {
  runtime: 'edge',
};

const getModelForProvider = (provider, model) => {
  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!apiKey) {
    throw new Error(`API key not found for provider: ${provider}`);
  }

  switch (provider) {
    case 'openai':
      return new ChatOpenAI({
        modelName: model,
        streaming: true,
        openAIApiKey: apiKey,
      });
    case 'google':
      return new ChatGoogleGenerativeAI({
        modelName: model,
        streaming: true,
        apiKey: apiKey,
      });
    case 'anthropic':
      return new ChatAnthropic({
        modelName: model,
        streaming: true,
        anthropicApiKey: apiKey,
      });
    default:
      throw new Error(`Provider not supported: ${provider}`);
  }
};

export default async function POST(req) {
  const { messages, provider, model } = await req.json();

  const { stream, handlers } = LangChainStream();

  try {
    const llm = getModelForProvider(provider, model);

    llm.call(
      messages.map((m) =>
        m.role === 'user'
          ? new HumanMessage(m.content)
          : new AIMessage(m.content)
      ),
      {},
      [handlers]
    );

    return new StreamingTextResponse(stream);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
