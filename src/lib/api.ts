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
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    let url: string;

    switch (provider.id) {
      case "openai":
        url = "https://api.openai.com/v1/models";
        headers.Authorization = `Bearer ${apiKey}`;
        break;
      case "anthropic":
        url = "https://api.anthropic.com/v1/models";
        headers["x-api-key"] = apiKey;
        break;
      case "google":
        url = "https://generativelanguage.googleapis.com/v1/models";
        headers.Authorization = `Bearer ${apiKey}`;
        break;
      case "mistral":
        url = "https://api.mistral.ai/v1/models";
        headers.Authorization = `Bearer ${apiKey}`;
        break;
      case "openrouter":
        url = "https://openrouter.ai/api/v1/models";
        headers.Authorization = `Bearer ${apiKey}`;
        break;
      case "cohere":
        url = "https://api.cohere.ai/v1/models";
        headers.Authorization = `Bearer ${apiKey}`;
        break;
      default:
        throw new APIError("Provider not supported for model fetching");
    }

    response = await fetch(url, { headers });

    if (!response.ok) {
      throw new APIError(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched models for ${provider.id}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching models for ${provider.id}:`, error);
    throw new APIError(error instanceof Error ? error.message : "Failed to fetch models from provider");
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
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    let url: string;
    let body: any;

    switch (provider.id) {
      case "openai":
        url = "https://api.openai.com/v1/chat/completions";
        headers.Authorization = `Bearer ${apiKey}`;
        body = {
          model: modelId,
          messages: messages,
        };
        break;

      case "anthropic":
        url = "https://api.anthropic.com/v1/messages";
        headers["x-api-key"] = apiKey;
        body = {
          model: modelId,
          messages: messages.map(msg => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          })),
        };
        break;

      case "google":
        url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent`;
        headers.Authorization = `Bearer ${apiKey}`;
        body = {
          contents: messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          })),
        };
        break;

      case "mistral":
        url = "https://api.mistral.ai/v1/chat/completions";
        headers.Authorization = `Bearer ${apiKey}`;
        body = {
          model: modelId,
          messages: messages,
        };
        break;

      case "openrouter":
        url = "https://openrouter.ai/api/v1/chat/completions";
        headers.Authorization = `Bearer ${apiKey}`;
        body = {
          model: modelId,
          messages: messages,
        };
        break;

      case "cohere":
        url = "https://api.cohere.ai/v1/generate";
        headers.Authorization = `Bearer ${apiKey}`;
        body = {
          model: modelId,
          prompt: messages[messages.length - 1].content,
          max_tokens: 1000,
        };
        break;

      default:
        throw new APIError("Provider not supported");
    }

    console.log(`Making API request to ${url}`);
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error response from ${provider.id}:`, errorText);
      throw new APIError(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API Response from ${provider.id}:`, data);

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
      case "google":
        message = data.candidates[0].content.parts[0].text;
        usage = {
          total_tokens: data.usage?.totalTokens,
          prompt_tokens: data.usage?.promptTokens,
          completion_tokens: data.usage?.completionTokens,
        };
        break;
      case "mistral":
        message = data.choices[0].message.content;
        usage = data.usage;
        break;
      case "cohere":
        message = data.generations[0].text;
        usage = {
          total_tokens: data.meta.billed_tokens,
        };
        break;
      default:
        message = data.choices?.[0]?.message?.content || data.content || "No response content";
    }

    return {
      message,
      usage,
    };
  } catch (error) {
    console.error(`API Error with ${provider.id}:`, error);
    throw new APIError(error instanceof Error ? error.message : "Failed to send message to provider");
  }
}