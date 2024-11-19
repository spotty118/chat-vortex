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
      case "openai":
        response = await fetch("https://api.openai.com/v1/models", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        break;
      case "anthropic":
        response = await fetch("https://api.anthropic.com/v1/models", {
          headers: {
            "x-api-key": apiKey,
          },
        });
        break;
      case "openrouter":
        response = await fetch("https://openrouter.ai/api/v1/models", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        break;
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
      case "openai":
        response = await fetch("https://api.openai.com/v1/chat/completions", {
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
      case "anthropic":
        response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages.map(msg => ({
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
            })),
          }),
        });
        break;
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
      default:
        throw new APIError("Provider not supported");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error response:", errorText);
      throw new APIError(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    // Handle different response formats
    let message = "";
    let usage = undefined;

    switch (provider.id) {
      case "openai":
      case "openrouter":
        message = data.choices[0].message.content;
        usage = data.usage;
        break;
      case "anthropic":
        message = data.content[0].text;
        usage = data.usage;
        break;
      default:
        message = data.choices?.[0]?.message?.content || data.content || "No response content";
    }

    return {
      message,
      usage,
    };
  } catch (error) {
    console.error("API Error:", error);
    throw new APIError(error instanceof APIError ? error.message : "Failed to send message to provider");
  }
}