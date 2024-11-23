import { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Provider } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { ModelSelector } from "@/components/ModelSelector";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { AISettings } from "@/components/AISettings";
import { TokenUsageDisplay } from "@/components/TokenUsageDisplay";
import { useAISettings } from "@/hooks/useAISettings";
import { fetchModels, sendMessage, APIError } from "@/lib/api";
import { saveConversation, exportConversation } from "@/lib/conversation";
import { MessageWithMetadata } from "@/lib/types/ai";

interface ChatProps {
  provider: Provider;
}

export const Chat = ({ provider }: ChatProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageWithMetadata[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [controller, setController] = useState<AbortController | null>(null);
  const conversationId = useRef(nanoid());
  const { settings, updateSettings } = useAISettings();
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(`Provider changed to: ${provider.name}`);
    setAvailableModels([]);
    setSelectedModel("");
    setMessages([]);
    conversationId.current = nanoid();
    
    const loadModels = async () => {
      try {
        console.log(`Fetching models for ${provider.name}...`);
        const models = await fetchModels(provider);
        const modelList = models.data || models;
        console.log(`Received models for ${provider.name}:`, modelList);
        
        setAvailableModels(modelList);
        if (modelList?.[0]?.id) {
          setSelectedModel(modelList[0].id);
        }
      } catch (error) {
        console.error(`Error loading models for ${provider.name}:`, error);
      }
    };

    loadModels();
  }, [provider]);

  useEffect(() => {
    if (messages.length > 0) {
      saveConversation({
        id: conversationId.current,
        provider: provider.id,
        model: selectedModel,
        messages,
        createdAt: messages[0].timestamp,
        updatedAt: Date.now(),
      });
    }
  }, [messages, provider.id, selectedModel]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedModel) return;

    const userMessage: MessageWithMetadata = {
      id: nanoid(),
      role: "user",
      content: input,
      timestamp: Date.now(),
      metadata: {
        model: selectedModel,
        ...settings
      }
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const newController = new AbortController();
    setController(newController);

    try {
      console.log(`Sending message using model: ${selectedModel} with settings:`, settings);
      const response = await sendMessage(
        provider, 
        selectedModel, 
        [...messages, userMessage],
        newController.signal,
        settings
      );
      
      const assistantMessage: MessageWithMetadata = {
        id: nanoid(),
        role: "assistant",
        content: response.message,
        timestamp: Date.now(),
        metadata: {
          model: selectedModel,
          ...settings
        },
        usage: response.usage
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.usage) {
        console.log("Token usage:", response.usage);
      }
    } catch (error) {
      if (error instanceof APIError) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        
        setMessages(prev => prev.slice(0, -1));
        setInput(userMessage.content);
      }
    } finally {
      setIsLoading(false);
      setController(null);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const totalUsage = messages.reduce((acc, msg) => {
    return {
      prompt_tokens: acc.prompt_tokens + (msg.usage?.prompt_tokens || 0),
      completion_tokens: acc.completion_tokens + (msg.usage?.completion_tokens || 0),
      total_tokens: acc.total_tokens + (msg.usage?.total_tokens || 0)
    };
  }, { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <ModelSelector
            selectedModel={selectedModel}
            availableModels={availableModels}
            onModelSelect={setSelectedModel}
          />
          <AISettings settings={settings} onUpdate={updateSettings} />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="pl-8 w-[200px]"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => exportConversation({
              id: conversationId.current,
              provider: provider.id,
              model: selectedModel,
              messages,
              createdAt: messages[0]?.timestamp || Date.now(),
              updatedAt: Date.now(),
            })}
            title="Export conversation"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <MessageList messages={filteredMessages} />
      <div ref={bottomRef} />

      <div className="mt-4 border-t pt-4 space-y-4">
        <TokenUsageDisplay usage={totalUsage} maxTokens={settings.maxTokens || 2000} />
        <MessageInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onSendMessage={handleSend}
          onClearChat={() => {
            setMessages([]);
            conversationId.current = nanoid();
          }}
          onStopResponse={() => {
            if (controller) {
              controller.abort();
              setIsLoading(false);
              setController(null);
            }
          }}
        />
      </div>
    </div>
  );
};