import { useMemo, useRef } from 'react';
import { ChatMessage } from '@/lib/types/ai';
import { Model } from '@/lib/types/models';

// Average tokens per character for rough estimation
const TOKENS_PER_CHAR = 0.25;

const estimateTokens = (text: string): number => {
  return Math.ceil(text.length * TOKENS_PER_CHAR);
};

export const useContextWindow = (
  messages: ChatMessage[],
  model: Model,
  reserveTokens: number = 500 // Reserve tokens for the response
) => {
  // Cache token estimates using message ID as key
  const tokenEstimateCache = useRef<Map<string, number>>(new Map());

  const tokenEstimates = useMemo(() => {
    return messages.map(msg => {
      // Check cache first
      if (msg.id && tokenEstimateCache.current.has(msg.id)) {
        return {
          ...msg,
          estimatedTokens: tokenEstimateCache.current.get(msg.id)!
        };
      }

      let estimatedTokens: number;
      if (typeof msg.content === 'string') {
        estimatedTokens = msg.tokens || estimateTokens(msg.content);
      } else {
        const content = msg.content as {
          text?: string;
          code?: { content: string };
          images?: string[];
        };
        
        let totalTokens = 0;
        if (content.text) {
          totalTokens += estimateTokens(content.text);
        }
        if (content.code?.content) {
          totalTokens += estimateTokens(content.code.content);
        }
        const imageTokens = (content.images?.length || 0) * 1000;
        estimatedTokens = msg.tokens || (totalTokens + imageTokens);
      }

      // Cache the result
      if (msg.id) {
        tokenEstimateCache.current.set(msg.id, estimatedTokens);
      }

      return {
        ...msg,
        estimatedTokens
      };
    });
  }, [messages]);

  const contextSize = useMemo(() => {
    return tokenEstimates.reduce((sum, msg) => sum + msg.estimatedTokens, 0);
  }, [tokenEstimates]);

  const availableSpace = model.contextWindow - reserveTokens;

  const fitsContext = contextSize <= availableSpace;

  const truncatedMessages = useMemo(() => {
    if (fitsContext) return messages;

    let totalTokens = 0;
    const truncated: ChatMessage[] = [];
    
    // Always include system messages and the last message
    const systemMessages = messages.filter(msg => 
      msg.role === 'system' || 
      msg === messages[messages.length - 1]
    );
    
    const systemTokens = systemMessages.reduce((sum, msg) => {
      const estimate = tokenEstimates.find(t => t.id === msg.id)?.estimatedTokens || 0;
      return sum + estimate;
    }, 0);

    totalTokens = systemTokens;
    truncated.push(...systemMessages);

    // Add remaining messages from newest to oldest until we hit the limit
    for (let i = messages.length - 2; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'system') continue;

      const estimate = tokenEstimates.find(t => t.id === msg.id)?.estimatedTokens || 0;
      if (totalTokens + estimate > availableSpace) break;

      totalTokens += estimate;
      truncated.unshift(msg);
    }

    return truncated;
  }, [messages, tokenEstimates, fitsContext, availableSpace]);

  return {
    contextSize,
    availableSpace,
    fitsContext,
    truncatedMessages,
    estimatedTokensPerMessage: tokenEstimates
  };
};
