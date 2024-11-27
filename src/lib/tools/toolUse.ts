import { Tool } from '../types/tools';
import axios from 'axios';

interface ExternalTool {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresAuth: boolean;
}

// Registry of external tools
const externalTools: Record<string, ExternalTool> = {
  weather: {
    name: 'weather',
    endpoint: 'https://api.weatherapi.com/v1/current.json',
    method: 'GET',
    requiresAuth: true
  },
  translation: {
    name: 'translation',
    endpoint: 'https://translation.googleapis.com/language/translate/v2',
    method: 'POST',
    requiresAuth: true
  },
  // Add more external tools as needed
};

export const toolUseTool: Tool = {
  name: "toolUse",
  description: "Use external tools and APIs",
  parameters: {
    toolName: {
      type: "string",
      description: "Name of the tool to use",
      enum: Object.keys(externalTools)
    },
    input: {
      type: "object",
      description: "Input parameters for the tool"
    },
    apiKey: {
      type: "string",
      description: "API key if required"
    }
  },
  required: ["toolName", "input"],
  handler: async (args) => {
    const { toolName, input, apiKey } = args;
    const tool = externalTools[toolName];

    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    if (tool.requiresAuth && !apiKey) {
      throw new Error(`Tool ${toolName} requires authentication`);
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await axios({
        method: tool.method,
        url: tool.endpoint,
        headers,
        data: tool.method !== 'GET' ? input : undefined,
        params: tool.method === 'GET' ? input : undefined
      });

      return {
        success: true,
        result: response.data
      };
    } catch (error) {
      throw new Error(`Error using tool ${toolName}: ${error.message}`);
    }
  }
};
