import { Tool } from '../types/tools';
import { OpenAIClient } from '../api/openai';
import { AnthropicClient } from '../api/anthropic';
import { GoogleClient } from '../api/googleApi';

interface ModelConfig {
  provider: string;
  supportedModels: string[];
  client: any;
}

const modelConfigs: Record<string, ModelConfig> = {
  openai: {
    provider: 'openai',
    supportedModels: ['gpt-4', 'gpt-3.5-turbo'],
    client: OpenAIClient
  },
  anthropic: {
    provider: 'anthropic',
    supportedModels: ['claude-2', 'claude-instant'],
    client: AnthropicClient
  },
  google: {
    provider: 'google',
    supportedModels: ['gemini-pro'],
    client: GoogleClient
  }
};

export const customInstructionsTool: Tool = {
  name: "customInstructions",
  description: "Set custom instructions for AI models",
  parameters: {
    provider: {
      type: "string",
      description: "AI provider name",
      enum: Object.keys(modelConfigs)
    },
    model: {
      type: "string",
      description: "Model identifier"
    },
    instructions: {
      type: "string",
      description: "Custom instructions for the model"
    },
    apiKey: {
      type: "string",
      description: "API key for the provider"
    },
    options: {
      type: "object",
      description: "Additional options",
      properties: {
        temperature: {
          type: "number",
          description: "Model temperature (0-1)",
          minimum: 0,
          maximum: 1
        },
        maxTokens: {
          type: "number",
          description: "Maximum tokens to generate"
        },
        topP: {
          type: "number",
          description: "Top P sampling value"
        }
      }
    }
  },
  required: ["provider", "model", "instructions", "apiKey"],
  handler: async (args) => {
    const { provider, model, instructions, apiKey, options = {} } = args;
    
    const config = modelConfigs[provider];
    if (!config) {
      throw new Error(`Provider ${provider} not supported`);
    }

    if (!config.supportedModels.includes(model)) {
      throw new Error(`Model ${model} not supported by ${provider}`);
    }

    try {
      const client = new config.client(apiKey);
      
      // Store instructions in the client's context
      const context = {
        model,
        instructions,
        ...options
      };

      // Set the custom instructions based on provider
      switch (provider) {
        case 'openai':
          await client.setSystemMessage(instructions);
          break;
        case 'anthropic':
          await client.setPromptPrefix(instructions);
          break;
        case 'google':
          await client.setContext(instructions);
          break;
        default:
          throw new Error(`Provider ${provider} not implemented`);
      }

      return {
        success: true,
        message: `Custom instructions set for ${model}`,
        context
      };
    } catch (error) {
      throw new Error(`Error setting custom instructions: ${error.message}`);
    }
  }
};
