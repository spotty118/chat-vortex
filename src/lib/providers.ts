import { Provider } from "./types";
import { Bot, Brain, Sparkles, Zap, Network, Cpu } from "lucide-react";

export const providers: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    description: "Access GPT-3.5, GPT-4, and other OpenAI models",
    models: [
      {
        id: "gpt-4",
        name: "GPT-4",
        provider: "openai",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.03,
        contextWindow: 8192,
        inputFormats: ["text"],
        outputFormats: ["text"],
        streamingSupport: true
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        capabilities: ["chat", "code"],
        tokenCost: 0.002,
        contextWindow: 4096,
        inputFormats: ["text"],
        outputFormats: ["text"],
        streamingSupport: true
      }
    ],
    status: "online",
    icon: Sparkles,
    features: {
      functionCalling: true,
      toolUse: true,
      parallelRequests: true,
      customInstructions: true,
      modelFinetuning: true,
      assistantAPI: true,
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 90000
      }
    }
  },
  {
    id: "google",
    name: "Google AI",
    logo: "https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg",
    description: "Access Gemini Pro and other Google AI models",
    models: [
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        provider: "google",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.0001,
        contextWindow: 32768,
        inputFormats: ["text"],
        outputFormats: ["text"],
        streamingSupport: true
      }
    ],
    status: "online",
    icon: Brain,
    features: {
      functionCalling: true,
      toolUse: true,
      parallelRequests: true,
      customInstructions: false,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 90000
      }
    }
  },
  {
    id: "anthropic",
    name: "Anthropic",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/25/Anthropic_logo.svg",
    description: "Access Claude and other Anthropic models",
    models: [
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        provider: "anthropic",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.015,
        contextWindow: 200000,
        inputFormats: ["text"],
        outputFormats: ["text"],
        streamingSupport: true
      },
      {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        provider: "anthropic",
        capabilities: ["chat", "code"],
        tokenCost: 0.003,
        contextWindow: 200000,
        inputFormats: ["text"],
        outputFormats: ["text"],
        streamingSupport: true
      }
    ],
    status: "online",
    icon: Bot,
    features: {
      functionCalling: true,
      toolUse: true,
      parallelRequests: true,
      customInstructions: true,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 50,
        tokensPerMinute: 80000
      }
    }
  },
  {
    id: "mistral",
    name: "Mistral AI",
    logo: "https://mistral.ai/images/logo-dark.svg",
    description: "Access Mistral's large language models",
    models: [
      {
        id: "mistral-large",
        name: "Mistral Large",
        provider: "mistral",
        capabilities: ["chat", "code"],
        tokenCost: 0.008,
        contextWindow: 32768,
        inputFormats: ["text"],
        outputFormats: ["text"],
        streamingSupport: true
      },
      {
        id: "mistral-medium",
        name: "Mistral Medium",
        provider: "mistral",
        capabilities: ["chat", "code"],
        tokenCost: 0.002,
        contextWindow: 32768,
        inputFormats: ["text"],
        outputFormats: ["text"],
        streamingSupport: true
      }
    ],
    status: "online",
    icon: Zap,
    features: {
      functionCalling: true,
      toolUse: false,
      parallelRequests: true,
      customInstructions: false,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 50,
        tokensPerMinute: 80000
      }
    }
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    logo: "https://openrouter.ai/favicon.ico",
    description: "Access multiple AI models through a single API",
    models: [
      {
        id: "openrouter/auto",
        name: "Auto",
        provider: "openrouter",
        capabilities: ["chat", "code"],
        tokenCost: 0.005,
        contextWindow: 16384,
        inputFormats: ["text"],
        outputFormats: ["text"],
        streamingSupport: true
      }
    ],
    status: "online",
    icon: Network,
    features: {
      functionCalling: false,
      toolUse: false,
      parallelRequests: true,
      customInstructions: false,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 50,
        tokensPerMinute: 80000
      }
    }
  },
  {
    id: "cohere",
    name: "Cohere",
    logo: "https://dashboard.cohere.ai/favicon.ico",
    description: "Access Cohere's command and other models",
    models: [
      {
        id: "command",
        name: "Command",
        provider: "cohere",
        capabilities: ["chat", "code"],
        tokenCost: 0.002,
        contextWindow: 4096,
        inputFormats: ["text"],
        outputFormats: ["text"],
        streamingSupport: true
      }
    ],
    status: "online",
    icon: Cpu,
    features: {
      functionCalling: false,
      toolUse: false,
      parallelRequests: true,
      customInstructions: false,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 40,
        tokensPerMinute: 60000
      }
    }
  }
];