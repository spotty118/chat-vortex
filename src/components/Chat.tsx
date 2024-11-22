import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Provider } from "@/lib/types";
import { Send, Loader2, HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ModelSelector } from "@/components/ModelSelector";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { fetchModels, sendMessage, APIError } from "@/lib/api";

interface ChatProps {
  provider: Provider;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const Chat = ({ provider }: ChatProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [controller, setController] = useState<AbortController | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Clear models and selected model when provider changes
    setAvailableModels([]);
    setSelectedModel("");
    
    const loadModels = async () => {
      try {
        const models = await fetchModels(provider);
        setAvailableModels(models.data || models);
        if (models.data?.[0]?.id || models[0]?.id) {
          setSelectedModel(models.data?.[0]?.id || models[0]?.id);
        }
      } catch (error) {
        console.error("Error loading models:", error);
        // Removed the error toast here
      }
    };

    loadModels();
  }, [provider]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedModel) return;

    const userMessage: Message = { role: "user", content: input };
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
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
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
    }
  };

  const handleStopResponse = () => {
    if (controller) {
      controller.abort();
      setIsLoading(false);
      setController(null);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput("");
    if (controller) {
      controller.abort();
      setIsLoading(false);
      setController(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ModelSelector
        selectedModel={selectedModel}
        availableModels={availableModels}
        onModelSelect={setSelectedModel}
      />
      <MessageList messages={messages} />
      <MessageInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onSendMessage={handleSend}
        onClearChat={handleClearChat}
        onStopResponse={handleStopResponse}
      />
    </div>
  );
};