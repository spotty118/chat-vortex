import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Trash2, Square } from "lucide-react";

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  selectedModel: string;
  onSendMessage: () => Promise<void>;
  onClearChat: () => void;
  onStopResponse: () => void;
}

export const MessageInput = ({
  input,
  setInput,
  isLoading,
  selectedModel,
  onSendMessage,
  onClearChat,
  onStopResponse,
}: MessageInputProps) => {
  return (
    <div className="pt-4">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onClearChat}
          className="px-3"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          className="bg-background/80 backdrop-blur-sm"
          disabled={isLoading}
        />
        {isLoading ? (
          <Button onClick={onStopResponse}>
            <Square className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={onSendMessage} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};