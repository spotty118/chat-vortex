import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { ChatMessage, SavedConversation as Conversation, ConversationMetadata } from '@/lib/types';

const STORAGE_KEY = 'vortex_conversations';

interface ConversationState {
  conversations: Record<string, Conversation>;
  activeConversationId: string | null;
  metadata: Record<string, ConversationMetadata>;
}

export const useConversationManager = () => {
  const [state, setState] = useState<ConversationState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      conversations: {},
      activeConversationId: null,
      metadata: {},
    };
  });

  // Debounced localStorage save
  const debouncedSave = useRef(
    debounce((state: ConversationState) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 1000)
  ).current;

  useEffect(() => {
    debouncedSave(state);
    return () => {
      debouncedSave.cancel();
    };
  }, [state, debouncedSave]);

  // Create a new conversation
  const createConversation = useCallback((
    title: string,
    systemMessage?: string
  ): string => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    setState(prev => ({
      ...prev,
      conversations: {
        ...prev.conversations,
        [id]: {
          id,
          provider: 'default', // Add a default provider
          model: 'default', // Add a default model
          messages: systemMessage ? [{
            id: crypto.randomUUID(),
            role: 'system',
            content: systemMessage,
            timestamp,
          }] : [],
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      },
      metadata: {
        ...prev.metadata,
        [id]: {
          id,
          title,
          messageCount: systemMessage ? 1 : 0,
          createdAt: timestamp,
          updatedAt: timestamp,
          lastMessage: systemMessage || null,
        },
      },
      activeConversationId: id,
    }));

    return id;
  }, []);

  // Add a message to a conversation
  const addMessage = useCallback((
    conversationId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ) => {
    const timestamp = Date.now();
    const messageId = crypto.randomUUID();

    setState(prev => {
      const conversation = prev.conversations[conversationId];
      if (!conversation) {
        throw new Error(`Conversation ${conversationId} not found`);
      }

      const newMessage = {
        ...message,
        id: messageId,
        timestamp,
      };

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: {
            ...conversation,
            messages: [...conversation.messages, newMessage],
            updatedAt: timestamp,
          },
        },
        metadata: {
          ...prev.metadata,
          [conversationId]: {
            ...prev.metadata[conversationId],
            messageCount: prev.metadata[conversationId].messageCount + 1,
            updatedAt: timestamp,
            lastMessage: typeof message.content === 'string' 
              ? message.content 
              : 'Complex message',
          },
        },
      };
    });

    return messageId;
  }, []);

  // Edit a message
  const editMessage = useCallback((
    conversationId: string,
    messageId: string,
    content: ChatMessage['content']
  ) => {
    const timestamp = Date.now();

    setState(prev => {
      const conversation = prev.conversations[conversationId];
      if (!conversation) {
        throw new Error(`Conversation ${conversationId} not found`);
      }

      const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        throw new Error(`Message ${messageId} not found`);
      }

      const newMessages = [...conversation.messages];
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        content,
        edited: true,
        editedAt: timestamp,
      };

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: {
            ...conversation,
            messages: newMessages,
            updatedAt: timestamp,
          },
        },
        metadata: {
          ...prev.metadata,
          [conversationId]: {
            ...prev.metadata[conversationId],
            updatedAt: timestamp,
            lastMessage: typeof content === 'string' ? content : 'Complex message',
          },
        },
      };
    });
  }, []);

  // Delete messages
  const deleteMessages = useCallback((
    conversationId: string,
    messageIds: string[]
  ) => {
    const timestamp = Date.now();

    setState(prev => {
      const conversation = prev.conversations[conversationId];
      if (!conversation) {
        throw new Error(`Conversation ${conversationId} not found`);
      }

      const newMessages = conversation.messages.filter(
        msg => !messageIds.includes(msg.id)
      );

      const lastMessage = newMessages[newMessages.length - 1];

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: {
            ...conversation,
            messages: newMessages,
            updatedAt: timestamp,
          },
        },
        metadata: {
          ...prev.metadata,
          [conversationId]: {
            ...prev.metadata[conversationId],
            messageCount: newMessages.length,
            updatedAt: timestamp,
            lastMessage: lastMessage 
              ? (typeof lastMessage.content === 'string' 
                ? lastMessage.content 
                : 'Complex message')
              : null,
          },
        },
      };
    });
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback((conversationId: string) => {
    setState(prev => {
      const { [conversationId]: _, ...remainingConversations } = prev.conversations;
      const { [conversationId]: __, ...remainingMetadata } = prev.metadata;

      return {
        ...prev,
        conversations: remainingConversations,
        metadata: remainingMetadata,
        activeConversationId: prev.activeConversationId === conversationId
          ? null
          : prev.activeConversationId,
      };
    });
  }, []);

  // Set active conversation
  const setActiveConversation = useCallback((conversationId: string | null) => {
    if (conversationId && !state.conversations[conversationId]) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    setState(prev => ({
      ...prev,
      activeConversationId: conversationId,
    }));
  }, [state.conversations]);

  // Update conversation title
  const updateTitle = useCallback((
    conversationId: string,
    title: string
  ) => {
    setState(prev => {
      if (!prev.metadata[conversationId]) {
        throw new Error(`Conversation ${conversationId} not found`);
      }

      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          [conversationId]: {
            ...prev.metadata[conversationId],
            title,
            updatedAt: Date.now(),
          },
        },
      };
    });
  }, []);

  return {
    conversations: state.conversations,
    metadata: state.metadata,
    activeConversationId: state.activeConversationId,
    activeConversation: state.activeConversationId 
      ? state.conversations[state.activeConversationId]
      : null,
    createConversation,
    addMessage,
    editMessage,
    deleteMessages,
    deleteConversation,
    setActiveConversation,
    updateTitle,
  };
};
