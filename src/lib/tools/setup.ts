import { Tool } from '../types/tools';

const defaultTools: Tool[] = [];

export const useTools = () => {
  return {
    tools: defaultTools,
    executeTool: async (toolCall: any) => {
      console.log('Executing tool:', toolCall);
      return { success: true, data: null };
    }
  };
};