import { SavedConversation } from './types/conversation';

export const saveConversation = (conversation: SavedConversation) => {
  console.log('Saved conversation:', conversation.id);
  localStorage.setItem(`conversation_${conversation.id}`, JSON.stringify(conversation));
};

export const exportConversation = (conversation: SavedConversation) => {
  const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conversation_${conversation.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};