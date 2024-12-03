import { Provider } from "../types";
import { Brain } from "lucide-react";

export const googleProvider: Provider = {
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
};