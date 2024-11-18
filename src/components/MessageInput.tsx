import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  selectedModel: string;
  onSendMessage: () => Promise<void>;
}

export const MessageInput = ({
  input,
  setInput,
  isLoading,
  selectedModel,
  onSendMessage,
}: MessageInputProps) => {
  return (
    <div className="pt-4">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          className="bg-background/80 backdrop-blur-sm"
          disabled={isLoading}
        />
        <Button onClick={onSendMessage} disabled={isLoading || !selectedModel}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};