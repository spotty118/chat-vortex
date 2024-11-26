import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { nanoid } from "nanoid";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Provider } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { ModelSelector } from "@/components/ModelSelector";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { TokenUsageDisplay } from "@/components/TokenUsageDisplay";
import { fetchModels, sendMessage, APIError } from "@/lib/api";
import { saveConversation, exportConversation } from "@/lib/conversation";
import { MessageWithMetadata } from "@/lib/types/ai";
import { Model } from "@/lib/types";
import { useTools } from '@/lib/tools/setup';

interface ChatProps {
  provider: Provider;
  attachments?: File[];
}

export const Chat = ({ provider, attachments }: ChatProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageWithMetadata[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [controller, setController] = useState<AbortController | null>(null);
  const [processedAttachments, setProcessedAttachments] = useState<string[]>([]);
  const conversationId = useRef(nanoid());
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { tools, executeTool } = useTools();

  // Maximum number of messages to keep in context
  const MAX_MESSAGES = 50;
  // Maximum total tokens to maintain in context
  const MAX_TOKENS = 4000;

  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log(`Initializing chat with provider: ${provider.name}`);
        setAvailableModels([]);
        setSelectedModel("");
        setMessages([]);
        conversationId.current = nanoid();
        
        console.log(`Fetching models for ${provider.name}...`);
        const models = await fetchModels(provider);
        const modelList = models.data || models;
        console.log(`Received models for ${provider.name}:`, modelList);
        
        if (modelList?.length > 0) {
          setAvailableModels(modelList);
          setSelectedModel(modelList[0].id);
        }
      } catch (error) {
        console.error(`Error initializing chat: ${error}`);
        toast({
          title: "Error",
          description: "Failed to initialize chat. Please try again.",
          variant: "destructive",
        });
      }
    };

    initializeChat();
  }, [provider.id]); // Only re-run if provider.id changes

  useEffect(() => {
    if (messages.length > 0) {
      try {
        saveConversation({
          id: conversationId.current,
          provider: provider.id,
          model: selectedModel,
          messages,
          createdAt: messages[0].timestamp,
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
  }, [messages.length, provider.id, selectedModel]);

  const truncateMessages = useCallback((msgs: MessageWithMetadata[]): MessageWithMetadata[] => {
    if (msgs.length <= MAX_MESSAGES) return msgs;

    // Keep system messages and last MAX_MESSAGES messages
    const systemMessages = msgs.filter(msg => msg.role === 'system');
    const nonSystemMessages = msgs.filter(msg => msg.role !== 'system');
    const recentMessages = nonSystemMessages.slice(-MAX_MESSAGES);

    return [...systemMessages, ...recentMessages];
  }, [MAX_MESSAGES]);

  const getContextMessages = useCallback((msgs: MessageWithMetadata[]): MessageWithMetadata[] => {
    let totalTokens = 0;
    const contextMessages: MessageWithMetadata[] = [];
    
    // Process messages from newest to oldest
    for (let i = msgs.length - 1; i >= 0; i--) {
      const msg = msgs[i];
      const msgTokens = msg.metadata?.tokens || 0;
      
      // Always include system messages and the most recent message
      if (msg.role === 'system' || i === msgs.length - 1) {
        contextMessages.unshift(msg);
        totalTokens += msgTokens;
        continue;
      }
      
      // Check if adding this message would exceed the token limit
      if (totalTokens + msgTokens > MAX_TOKENS) {
        break;
      }
      
      contextMessages.unshift(msg);
      totalTokens += msgTokens;
    }
    
    return contextMessages;
  }, [MAX_TOKENS]);

  // Memoize processed messages
  const processedMessages = useMemo(() => {
    const truncated = truncateMessages(messages);
    return getContextMessages(truncated);
  }, [messages, truncateMessages, getContextMessages]);

  const processAttachments = useCallback((files: File[]) => {
    if (!files.length) return;

    const currentModel = provider.models.find(m => m.id === selectedModel);
    if (!currentModel?.capabilities.includes("attachments")) {
      toast({
        title: "Model doesn't support attachments",
        description: "Please select a model that supports attachments to use this feature.",
        variant: "destructive",
      });
      return;
    }

    const newAttachments = files.filter(file => 
      !processedAttachments.includes(file.name)
    );

    if (newAttachments.length === 0) return;

    const attachmentMessages = newAttachments.map(file => ({
      id: nanoid(),
      role: "user" as const,
      content: `[Attached file: ${file.name}]`,
      timestamp: Date.now(),
      attachment: file
    }));
    
    setMessages(prev => [...prev, ...attachmentMessages]);
    setProcessedAttachments(prev => [...prev, ...newAttachments.map(file => file.name)]);
  }, [provider.models, selectedModel, processedAttachments, toast]);

  useEffect(() => {
    if (attachments?.length) {
      processAttachments(attachments);
    }
  }, [attachments, processAttachments]);

  const handleToolCall = async (toolCall: any) => {
    try {
      const result = await executeTool(toolCall);
      if (result.success) {
        // Add tool response to messages using the function updater form
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: nanoid(),
            role: 'assistant' as const,
            content: `Tool ${toolCall.name} executed successfully: ${JSON.stringify(result.data)}`,
            timestamp: Date.now(),
            metadata: { 
              toolCall, 
              toolCalls: undefined, 
              model: undefined, 
              provider: undefined, 
              tokens: undefined, 
              processingTime: undefined, 
              error: undefined, 
              sources: undefined
            }
          }
        ]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Tool execution failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    const query = searchQuery.toLowerCase();
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedModel) return;

    const userMessage: MessageWithMetadata = {
      id: nanoid(),
      role: "user",
      content: input,
      timestamp: Date.now(),
      metadata: {}
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput(typeof userMessage.content === 'string' ? userMessage.content : (userMessage.content as any).text || '');
    setIsLoading(true);

    const newController = new AbortController();
    setController(newController);

    try {
      console.log(`Sending message using model: ${selectedModel}`);
      const response = await sendMessage(
        provider, 
        selectedModel, 
        getContextMessages([...messages, userMessage]),
        newController.signal
      );
      
      const assistantMessage: MessageWithMetadata = {
        id: nanoid(),
        role: "assistant",
        content: response.message,
        timestamp: Date.now(),
        metadata: {},
        usage: response.usage
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.usage) {
        console.log("Token usage:", response.usage);
      }

      if (response.metadata?.toolCalls) {
        for (const toolCall of response.metadata.toolCalls) {
          await handleToolCall(toolCall);
        }
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
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExport = () => {
    exportConversation({
      id: conversationId.current,
      provider: provider.id,
      model: selectedModel,
      messages,
      createdAt: messages[0]?.timestamp || Date.now(),
      updatedAt: Date.now(),
    });
  };

  const handleStop = () => {
    if (controller) {
      controller.abort();
      setIsLoading(false);
      setController(null);
    }
  };

  const totalUsage = messages.reduce((acc, msg) => {
    return {
      prompt_tokens: acc.prompt_tokens + (msg.usage?.prompt_tokens || 0),
      completion_tokens: acc.completion_tokens + (msg.usage?.completion_tokens || 0),
      total_tokens: acc.total_tokens + (msg.usage?.total_tokens || 0)
    };
  }, { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 });

  const clearChat = () => {
    setMessages([]);
    setProcessedAttachments([]);
    conversationId.current = nanoid();
    toast({
      title: "Chat cleared",
      description: "The conversation has been reset.",
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <ModelSelector
              availableModels={availableModels}
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </div>
          <div className="flex space-x-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleExport}
              title="Export conversation"
              className="shrink-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={clearChat}
              title="Clear chat"
              className="shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {filteredMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No messages yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation with {provider.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <MessageList
                  messages={processedMessages}
                  isLoading={isLoading}
                  provider={provider}
                />
                <div ref={bottomRef} />
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-w-2xl flex-col gap-3">
              <MessageInput
                input={input}
                setInput={setInput}
                onSend={handleSend}
                isLoading={isLoading}
                onStop={handleStop}
              />
              <div className="px-2">
                <TokenUsageDisplay 
                  usage={totalUsage}
                  maxTokens={4096}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};