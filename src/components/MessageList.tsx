import { memo } from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageWithMetadata } from "@/lib/types/ai";
import { Provider } from "@/lib/types";

interface MessageListProps {
  messages: MessageWithMetadata[];
  isLoading: boolean;
  provider: Provider;
}

const MessageItem = memo(({ message, provider }: { message: MessageWithMetadata; provider: Provider }) => (
  <div
    className={cn(
      "flex items-start gap-4 rounded-2xl px-6 py-4 transition-all duration-200 ease-in-out hover:shadow-sm",
      message.role === "assistant" 
        ? "bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10" 
        : "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/10 dark:to-gray-900/10"
    )}
  >
    <div className={cn(
      "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full transition-all duration-200",
      message.role === "assistant" 
        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md" 
        : "bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-md"
    )}>
      {message.role === "assistant" ? (
        <Bot className="h-5 w-5" />
      ) : (
        <User className="h-5 w-5" />
      )}
    </div>
    <div className="flex-1 space-y-3">
      <div className="prose prose-sm break-words dark:prose-invert">
        {message.content}
      </div>
      {message.usage && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
          <span className="font-medium">{message.usage.total_tokens} tokens</span>
          <span className="text-muted-foreground/60">•</span>
          <span className="font-medium">{provider.name}</span>
        </div>
      )}
    </div>
  </div>
));

MessageItem.displayName = "MessageItem";

export const MessageList = memo(({ messages, isLoading, provider }: MessageListProps) => {
  return (
    <div className="space-y-6 px-4">
      {messages.map((message) => (
        <MessageItem 
          key={message.id} 
          message={message} 
          provider={provider}
        />
      ))}
      
      {isLoading && (
        <div className="flex items-start gap-4 rounded-2xl px-6 py-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-[60%]" />
            <Skeleton className="h-5 w-[80%]" />
            <Skeleton className="h-5 w-[40%]" />
          </div>
        </div>
      )}
    </div>
  );
});

MessageList.displayName = "MessageList";