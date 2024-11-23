import { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { Search, Download, Star, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Provider, ChatMessage } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { ModelSelector } from "@/components/ModelSelector";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { fetchModels, sendMessage, APIError } from "@/lib/api";
import { saveConversation, exportConversation } from "@/lib/conversation";

interface ChatProps {
  provider: Provider;
}

export const Chat = ({ provider }: ChatProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [controller, setController] = useState<AbortController | null>(null);
  const [tokenCount, setTokenCount] = useState(0);
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

    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: input,
      timestamp: Date.now(),
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
      
      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: response.message,
        timestamp: Date.now(),
        tokens: response.usage?.total_tokens,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setTokenCount(prev => prev + (response.usage?.total_tokens || 0));
      
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
    if (messages.length === 0) {
      toast({
        title: "Nothing to export",
        description: "Start a conversation first!",
      });
      return;
    }

    exportConversation({
      id: conversationId.current,
      provider: provider.id,
      model: selectedModel,
      messages,
      createdAt: messages[0].timestamp,
      updatedAt: Date.now(),
    });

    toast({
      title: "Conversation exported",
      description: "Check your downloads folder",
    });
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <ModelSelector
          selectedModel={selectedModel}
          availableModels={availableModels}
          onModelSelect={setSelectedModel}
        />
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
            onClick={handleExport}
            title="Export conversation"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <MessageList messages={filteredMessages} />
      <div ref={bottomRef} />

      <div className="mt-4 border-t pt-4">
        {tokenCount > 0 && (
          <div className="text-sm text-muted-foreground mb-2">
            Total tokens used: {tokenCount}
          </div>
        )}
        <MessageInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onSendMessage={handleSend}
          onClearChat={() => {
            setMessages([]);
            setTokenCount(0);
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