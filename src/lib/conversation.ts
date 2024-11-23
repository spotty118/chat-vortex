import { SavedConversation, ChatMessage } from './types';

export const saveConversation = (conversation: SavedConversation) => {
  try {
    const conversations = getConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    localStorage.setItem('conversations', JSON.stringify(conversations));
    console.log('Saved conversation:', conversation.id);
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
};

export const getConversations = (): SavedConversation[] => {
  try {
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
};

export const exportConversation = (conversation: SavedConversation) => {
  const fileName = `chat-${conversation.id}-${new Date().toISOString()}.json`;
  const json = JSON.stringify(conversation, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  
  URL.revokeObjectURL(url);
};