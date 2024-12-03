import { Provider } from "../types";
import { Network } from "lucide-react";

export const openrouterProvider: Provider = {
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
};