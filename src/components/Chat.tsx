import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Provider } from "@/lib/types";
import { Send, Loader2, HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sendMessage, fetchModels, APIError } from "@/lib/api";

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
  const { toast } = useToast();

  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await fetchModels(provider);
        setAvailableModels(models.data || models);
        if (models.data?.[0]?.id || models[0]?.id) {
          setSelectedModel(models.data?.[0]?.id || models[0]?.id);
        }
      } catch (error) {
        console.error("Error loading models:", error);
        toast({
          title: "Error",
          description: "Failed to load available models",
          variant: "destructive",
        });
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

    try {
      console.log(`Sending message using model: ${selectedModel}`);
      const response = await sendMessage(provider, selectedModel, [...messages, userMessage]);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.usage) {
        console.log("Token usage:", response.usage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof APIError ? error.message : "Failed to send message",
        variant: "destructive",
      });
      
      setMessages(prev => prev.slice(0, -1));
      setInput(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Select Model</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground/70 hover:text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Pricing shown per 1,000 tokens</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
        >
          <SelectTrigger className="w-[300px] bg-white/90 backdrop-blur-sm border-neutral-200 hover:bg-white/95 transition-colors">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent 
            className="max-h-[300px] w-[300px] bg-white/95 backdrop-blur-sm border-neutral-200 shadow-lg"
          >
            {availableModels.map((model) => (
              <SelectItem 
                key={model.id} 
                value={model.id}
                className="py-3 px-4 hover:bg-neutral-50 focus:bg-neutral-50 cursor-pointer"
              >
                <div className="flex flex-col gap-2.5 w-full">
                  <span className="font-medium text-sm whitespace-normal break-words leading-snug text-neutral-900">
                    {model.name || model.id}
                  </span>
                  {model.pricing && (
                    <div className="text-sm text-muted-foreground space-y-1.5">
                      <div className="whitespace-normal break-words leading-relaxed flex justify-between">
                        <span>Prompt:</span>
                        <span className="font-medium">${model.pricing.prompt}/1k tokens</span>
                      </div>
                      <div className="whitespace-normal break-words leading-relaxed flex justify-between">
                        <span>Completion:</span>
                        <span className="font-medium">${model.pricing.completion}/1k tokens</span>
                      </div>
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-electric text-white"
                    : "bg-background/80 backdrop-blur-sm"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="pt-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="bg-background/80 backdrop-blur-sm"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !selectedModel}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};