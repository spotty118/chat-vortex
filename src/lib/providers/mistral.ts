import { Provider } from "../types";
import { Zap } from "lucide-react";

export const mistralProvider: Provider = {
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
};