import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Provider } from "@/lib/types";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendMessage, APIError } from "@/lib/api";

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
  const [selectedModel, setSelectedModel] = useState<string>(provider.models[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
      
      // Remove the user message if the API call failed
      setMessages(prev => prev.slice(0, -1));
      setInput(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
        >
          <SelectTrigger className="w-[200px] bg-background/80 backdrop-blur-sm">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {provider.models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex flex-col">
                  <span>{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ${model.tokenCost}/1k tokens
                  </span>
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
          <Button onClick={handleSend} disabled={isLoading}>
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