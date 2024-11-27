import { useState } from "react";
import { Loader2, Send, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
}

export const MessageInput = ({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
}: MessageInputProps) => {
  const [rows, setRows] = useState(1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lineCount = e.target.value.split("\n").length;
    setRows(Math.min(lineCount, 5));
    setInput(e.target.value);
  };

  return (
    <div className="relative flex items-center">
      <Textarea
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={rows}
        className="resize-none pr-24 rounded-2xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
        disabled={isLoading}
      />
      <div className="absolute right-2 bottom-1/2 transform translate-y-1/2">
        <div className="flex space-x-2">
          {isLoading ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onStop}
              className="h-8 w-8 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => input.trim() && onSend()}
              disabled={!input.trim()}
              className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};