import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/lib/types";
import { format } from "date-fns";

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex flex-col gap-1">
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-electric text-white"
                    : "bg-background/80 backdrop-blur-sm"
                }`}
              >
                {message.content}
              </div>
              <span className="text-xs text-muted-foreground px-1">
                {format(message.timestamp, 'HH:mm · MMM d, yyyy')}
                {message.tokens && ` · ${message.tokens} tokens`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};