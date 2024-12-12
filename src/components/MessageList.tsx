import { MessageWithMetadata } from "@/lib/types/ai";
import { Provider } from "@/lib/types";
import { ChainOfThoughtSteps } from "./ChainOfThoughtSteps";

interface MessageListProps {
  messages: MessageWithMetadata[];
  isLoading: boolean;
  provider: Provider;
}

export const MessageList = ({ messages, isLoading, provider }: MessageListProps) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="space-y-2">
          <div className={`p-4 rounded-lg ${
            message.role === "user" ? "bg-primary/10" : "bg-muted"
          }`}>
            <div className="text-sm">{message.content}</div>
          </div>
          
          {/* Display chain of thought steps if available */}
          {message.role === "assistant" && message.metadata?.thoughtSteps && (
            <div className="ml-4">
              <ChainOfThoughtSteps steps={message.metadata.thoughtSteps} />
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="p-4 rounded-lg bg-muted">
          <div className="text-sm animate-pulse">Thinking...</div>
        </div>
      )}
    </div>
  );
};