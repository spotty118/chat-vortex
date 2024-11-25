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
import { TokenUsageDisplay } from "@/components/TokenUsageDisplay";
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
      metadata: {}
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const newController = new AbortController();
    setController(newController);

    try {
      console.log(`Sending message using model: ${selectedModel}`);
      const response = await sendMessage(
        provider, 
        selectedModel, 
        [...messages, userMessage],
        newController.signal
      );
      
      const assistantMessage: MessageWithMetadata = {
        id: nanoid(),
        role: "assistant",
        content: response.message,
        timestamp: Date.now(),
        metadata: {},
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

  const handleExport = () => {
    exportConversation({
      id: conversationId.current,
      provider: provider.id,
      model: selectedModel,
      messages,
      createdAt: messages[0]?.timestamp || Date.now(),
      updatedAt: Date.now(),
    });
  };

  const handleStop = () => {
    if (controller) {
      controller.abort();
      setIsLoading(false);
      setController(null);
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
    <div className="flex h-full flex-col space-y-4 p-4 md:p-8">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <div className="flex-1">
          <ModelSelector
            availableModels={availableModels}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
          />
        </div>
        <div className="flex space-x-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            title="Export conversation"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-lg border bg-background shadow">
        <div className="absolute inset-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <MessageList
              messages={filteredMessages}
              isLoading={isLoading}
              provider={provider}
            />
            <div ref={bottomRef} />
          </div>
          
          <div className="border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-w-2xl flex-col gap-2">
              <MessageInput
                input={input}
                setInput={setInput}
                onSend={handleSend}
                isLoading={isLoading}
                onStop={handleStop}
              />
              <TokenUsageDisplay 
                usage={{ 
                  total_tokens: messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0),
                  prompt_tokens: messages.filter(m => m.role === 'user').reduce((sum, msg) => sum + (msg.tokens || 0), 0),
                  completion_tokens: messages.filter(m => m.role === 'assistant').reduce((sum, msg) => sum + (msg.tokens || 0), 0)
                }}
                maxTokens={4096}  
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};