import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { aiService } from '@/lib/ai-service';
import { useEffect, useState } from 'react';

export function AIChat() {
  const [state, setState] = useState(aiService.getState());

  useEffect(() => {
    // Subscribe to state changes
    const interval = setInterval(() => {
      const newState = aiService.getState();
      if (JSON.stringify(newState) !== JSON.stringify(state)) {
        setState(newState);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [state]);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    headers: state.apiKey ? {
      'Authorization': `Bearer ${state.apiKey}`,
      'X-Provider': state.provider?.toString() || 'openai',
      'X-Model-ID': state.modelId || 'gpt-3.5-turbo'
    } : {}
  });

  if (!state.apiKey || !state.provider || !state.modelId) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-4">
        <div className="text-center">
          Please set your API key, provider, and model in settings
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-4">
      <ScrollArea className="h-[400px] pr-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-4">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="w-full mb-2"
        />
        <Button type="submit">Send</Button>
      </form>
    </Card>
  );
}