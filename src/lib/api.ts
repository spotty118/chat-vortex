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

export const fetchModels = async (provider: Provider): Promise<any> => {
  const apiKey = localStorage.getItem(`${provider.id}_api_key`);
  if (!apiKey) {
    throw new APIError("API key not found");
  }

  console.log(`Fetching models for provider: ${provider.id}`);

  try {
    let response;
    
    switch (provider.id) {
      case "openrouter":
        response = await fetch("https://openrouter.ai/api/v1/models", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        break;
      // Add cases for other providers here
      default:
        throw new APIError("Provider not supported for model fetching");
    }

    if (!response.ok) {
      throw new APIError(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched models:", data);
    return data;
  } catch (error) {
    console.error("Error fetching models:", error);
    throw new APIError("Failed to fetch models from provider");
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
    let response;
    
    switch (provider.id) {
      case "openrouter":
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages,
          }),
        });
        break;
      // Add cases for other providers here
      default:
        throw new APIError("Provider not supported");
    }

    if (!response.ok) {
      throw new APIError(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    return {
      message: data.choices[0].message.content,
      usage: data.usage,
    };
  } catch (error) {
    console.error("API Error:", error);
    throw new APIError("Failed to send message to provider");
  }
}