import { Provider } from "./types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "APIError";
  }
}

export const sendMessage = async (
  provider: Provider,
  modelId: string,
  messages: ChatMessage[]
): Promise<ChatResponse> => {
  console.log(`Sending message to ${provider.name} using model ${modelId}`);
  
  const apiKey = localStorage.getItem(`${provider.id}_api_key`);
  if (!apiKey) {
    throw new APIError("API key not found. Please configure the provider first.");
  }

  try {
    // This is where you'd make the actual API call to the provider
    // For now, we'll simulate a response
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    return {
      message: "This is a simulated response. Replace with actual API integration.",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    };
  } catch (error) {
    console.error("API Error:", error);
    throw new APIError("Failed to send message to provider");
  }
}