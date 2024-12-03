import { Provider } from "../types";
import { Cpu } from "lucide-react";

export const cohereProvider: Provider = {
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
};