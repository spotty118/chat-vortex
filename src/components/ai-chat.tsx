import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

export function AIChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

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

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit">Send</Button>
      </form>
    </Card>
  );
}
