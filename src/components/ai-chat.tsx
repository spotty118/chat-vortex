import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { providers } from '@/lib/providers';
import type { Provider, AIActions } from '@/lib/types';
import { ai } from '@/lib/ai-service';

export function AIChat() {
  const [input, setInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const { messages, isLoading, append } = useChat();

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      ai.setState((draft) => {
        draft.provider = provider;
      });
      setSelectedModel('');
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    ai.setState((draft) => {
      draft.modelId = modelId;
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProvider || !selectedModel) {
      alert('Please select a provider and model first');
      return;
    }
    await append({ 
      role: 'user', 
      content: input 
    });
    setInput('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-4 flex gap-2">
        <Select onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={handleModelChange}
          disabled={!selectedProvider}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {selectedProvider?.models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isLoading || !selectedProvider || !selectedModel}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !selectedProvider || !selectedModel}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </Card>
  );
}
