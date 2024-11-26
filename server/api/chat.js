import { StreamingTextResponse, LangChainStream, OpenAIStream } from 'ai';
import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
};

export default async function POST(req) {
  const { messages } = await req.json();

  const openai = new OpenAI({
    apiKey: req.headers.get('Authorization')?.split('Bearer ')[1],
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: messages.map((message) => ({
      content: message.content,
      role: message.role,
    })),
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
