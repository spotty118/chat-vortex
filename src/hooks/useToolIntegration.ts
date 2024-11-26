import { useState, useCallback } from 'react';
import { Tool, ToolCall, ToolResult } from '@/lib/types/tools';

interface ToolRegistry {
  [key: string]: Tool;
}

interface ToolState {
  availableTools: ToolRegistry;
  activeTools: Set<string>;
  executionHistory: ToolCall[];
}

export const useToolIntegration = () => {
  const [state, setState] = useState<ToolState>({
    availableTools: {},
    activeTools: new Set(),
    executionHistory: [],
  });

  // Register a new tool
  const registerTool = useCallback((tool: Tool) => {
    setState(prev => ({
      ...prev,
      availableTools: {
        ...prev.availableTools,
        [tool.name]: tool,
      },
    }));
  }, []);

  // Register multiple tools at once
  const registerTools = useCallback((tools: Tool[]) => {
    setState(prev => ({
      ...prev,
      availableTools: {
        ...prev.availableTools,
        ...Object.fromEntries(tools.map(tool => [tool.name, tool])),
      },
    }));
  }, []);

  // Enable/disable tools
  const setToolAvailability = useCallback((toolNames: string[], enabled: boolean) => {
    setState(prev => {
      const newActiveTools = new Set(prev.activeTools);
      toolNames.forEach(name => {
        if (enabled) {
          newActiveTools.add(name);
        } else {
          newActiveTools.delete(name);
        }
      });
      return {
        ...prev,
        activeTools: newActiveTools,
      };
    });
  }, []);

  // Get tool function definitions for model
  const getToolDefinitions = useCallback((): any[] => {
    return Object.values(state.availableTools)
      .filter(tool => state.activeTools.has(tool.name))
      .map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      }));
  }, [state.availableTools, state.activeTools]);

  // Execute a tool call
  const executeTool = useCallback(async (
    toolCall: ToolCall
  ): Promise<ToolResult> => {
    const tool = state.availableTools[toolCall.name];
    if (!tool) {
      throw new Error(`Tool ${toolCall.name} not found`);
    }

    if (!state.activeTools.has(toolCall.name)) {
      throw new Error(`Tool ${toolCall.name} is not currently active`);
    }

    const startTime = Date.now();
    try {
      const result = await tool.handler(toolCall.arguments);
      const endTime = Date.now();

      const executionRecord = {
        ...toolCall,
        timestamp: startTime,
        duration: endTime - startTime,
        success: true,
        result,
      };

      setState(prev => ({
        ...prev,
        executionHistory: [...prev.executionHistory, executionRecord],
      }));

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const endTime = Date.now();
      const executionRecord = {
        ...toolCall,
        timestamp: startTime,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      setState(prev => ({
        ...prev,
        executionHistory: [...prev.executionHistory, executionRecord],
      }));

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [state.availableTools, state.activeTools]);

  // Get tool execution history
  const getToolHistory = useCallback((
    toolName?: string,
    limit?: number
  ) => {
    let history = state.executionHistory;
    if (toolName) {
      history = history.filter(call => call.name === toolName);
    }
    if (limit) {
      history = history.slice(-limit);
    }
    return history;
  }, [state.executionHistory]);

  // Clear tool history
  const clearToolHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      executionHistory: [],
    }));
  }, []);

  return {
    registerTool,
    registerTools,
    setToolAvailability,
    getToolDefinitions,
    executeTool,
    getToolHistory,
    clearToolHistory,
    availableTools: state.availableTools,
    activeTools: state.activeTools,
  };
};
