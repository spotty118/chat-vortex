import { Provider } from "../types";
import { Bot } from "lucide-react";

export const anthropicProvider: Provider = {
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
};