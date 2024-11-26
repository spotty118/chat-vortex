import { useMemo, useRef, useCallback } from 'react';
import { ChatMessage } from '@/lib/types/ai';
import { Model } from '@/lib/types/models';

// Average tokens per character for rough estimation
const TOKENS_PER_CHAR = 0.25;

// Memoize token estimation function
const createTokenEstimator = () => {
  const cache = new Map<string, number>();
  
  return (text: string): number => {
    if (cache.has(text)) {
      return cache.get(text)!;
    }
    const estimate = Math.ceil(text.length * TOKENS_PER_CHAR);
    cache.set(text, estimate);
    return estimate;
  };
};

export const useContextWindow = (
  messages: ChatMessage[],
  model: Model,
  reserveTokens: number = 500 // Reserve tokens for the response
) => {
  // Cache token estimates using message ID as key
  const tokenEstimateCache = useRef<Map<string, number>>(new Map());
  const estimator = useMemo(() => createTokenEstimator(), []);
  
  const estimateContentTokens = useCallback((content: {
    text?: string;
    code?: { content: string };
    images?: string[];
  }): number => {
    let totalTokens = 0;
    
    if (content.text) {
      totalTokens += estimator(content.text);
    }
    if (content.code?.content) {
      totalTokens += estimator(content.code.content);
    }
    // Images have fixed token cost
    totalTokens += (content.images?.length || 0) * 1000;
    
    return totalTokens;
  }, [estimator]);

  const tokenEstimates = useMemo(() => {
    // Process messages in batches of 10
    const batchSize = 10;
    const results: Array<ChatMessage & { estimatedTokens: number }> = [];
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      batch.forEach(msg => {
        if (msg.id && tokenEstimateCache.current.has(msg.id)) {
          results.push({
            ...msg,
            estimatedTokens: tokenEstimateCache.current.get(msg.id)!
          });
          return;
        }

        let estimatedTokens: number;
        if (typeof msg.content === 'string') {
          estimatedTokens = msg.tokens || estimator(msg.content);
        } else {
          estimatedTokens = msg.tokens || estimateContentTokens(msg.content);
        }

        if (msg.id) {
          tokenEstimateCache.current.set(msg.id, estimatedTokens);
        }

        results.push({
          ...msg,
          estimatedTokens
        });
      });
    }

    return results;
  }, [messages, estimator, estimateContentTokens]);

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
