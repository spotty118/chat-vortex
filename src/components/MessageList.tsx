import { memo, useCallback, useRef, useEffect, useMemo } from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageWithMetadata } from "@/lib/types/ai";
import { Provider } from "@/lib/types";
import { useInView } from "react-intersection-observer";

interface MessageListProps {
  messages: MessageWithMetadata[];
  isLoading: boolean;
  provider: Provider;
}

// Memoize gradient classes
const GRADIENT_CLASSES = {
  assistant: {
    container: "bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10",
    avatar: "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
  },
  user: {
    container: "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/10 dark:to-gray-900/10",
    avatar: "bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-md"
  }
};

const MessageItem = memo(({ message, provider, isVisible }: { 
  message: MessageWithMetadata; 
  provider: Provider;
  isVisible: boolean;
}) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  });

  // Only render the full content if the message is in view or marked as visible
  const shouldRender = inView || isVisible;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start gap-4 rounded-2xl px-6 py-4 transition-all duration-200 ease-in-out hover:shadow-sm",
        message.role === "assistant" ? GRADIENT_CLASSES.assistant.container : GRADIENT_CLASSES.user.container
      )}
      style={{
        contain: 'content',
        willChange: shouldRender ? 'auto' : 'transform',
        height: shouldRender ? 'auto' : '80px' // Placeholder height
      }}
    >
      {shouldRender ? (
        <>
          <div className={cn(
            "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full transition-all duration-200",
            message.role === "assistant" ? GRADIENT_CLASSES.assistant.avatar : GRADIENT_CLASSES.user.avatar
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
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}
    </div>
  );
});

MessageItem.displayName = "MessageItem";

export const MessageList = memo(({ messages, isLoading, provider }: MessageListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const visibleMessages = useRef(new Set<string>());
  
  // Memoize the update function
  const debouncedUpdate = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          updateVisibleMessages();
        });
      }, 100); // 100ms debounce
    };
  }, []);

  const updateVisibleMessages = useCallback(() => {
    if (!listRef.current) return;

    const listRect = listRef.current.getBoundingClientRect();
    const buffer = window.innerHeight; // One viewport height buffer
    const updatedVisibleMessages = new Set<string>();

    // Batch DOM reads
    const messageRects = messages.map(message => ({
      id: message.id,
      element: document.getElementById(`message-${message.id}`),
    }));

    // Batch DOM operations
    messageRects.forEach(({ id, element }) => {
      if (!element) return;
      const elementRect = element.getBoundingClientRect();
      if (
        elementRect.top >= listRect.top - buffer &&
        elementRect.bottom <= listRect.bottom + buffer
      ) {
        updatedVisibleMessages.add(id);
      }
    });

    visibleMessages.current = updatedVisibleMessages;
  }, [messages]);

  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const observer = new ResizeObserver(debouncedUpdate);
    observer.observe(listElement);

    listElement.addEventListener('scroll', debouncedUpdate, { passive: true });

    return () => {
      observer.disconnect();
      listElement.removeEventListener('scroll', debouncedUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [debouncedUpdate]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  return (
    <div 
      ref={listRef}
      className="space-y-6 px-4"
      style={{
        contain: 'content',
        willChange: 'transform'
      }}
    >
      {messages.map((message, index) => (
        <div
          key={message.id}
          id={`message-${message.id}`}
          ref={index === messages.length - 1 ? lastMessageRef : null}
        >
          <MessageItem 
            message={message} 
            provider={provider}
            isVisible={visibleMessages.current.has(message.id)}
          />
        </div>
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