import { tools } from './index';
import { ChatService } from '../services/chat';
import { useToolIntegration } from '@/hooks/useToolIntegration';
import { useEffect, useMemo } from 'react';

export const setupTools = (chatService: ChatService) => {
  // Register all tools with the chat service
  tools.forEach(tool => {
    chatService.registerTool(tool);
  });
};

export const useTools = () => {
  const toolIntegration = useToolIntegration();

  // Register tools only once when the hook is first used
  useEffect(() => {
    tools.forEach(tool => {
      toolIntegration.registerTool(tool);
    });
  }, [toolIntegration]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    ...toolIntegration,
    tools
  }), [toolIntegration]);
};
