import { Provider } from "../types";
import { Sparkles } from "lucide-react";

export const openaiProvider: Provider = {
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
};