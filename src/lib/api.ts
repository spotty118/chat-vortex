import { Provider } from "./types";
import { fetchGoogleModels, sendGoogleMessage } from "./api/googleApi";
import { fetchOpenRouterModels, sendOpenRouterMessage } from "./api/openRouterApi";
import { fetchCloudflareModels, sendCloudflareMessage } from "./api/cloudflareApi";
import { APIError } from "./errors";
import { 
  fetchOpenAIModels, 
  fetchAnthropicModels, 
  fetchMistralModels, 
  fetchCohereModels,
  sendOpenAIMessage,
  sendAnthropicMessage,
  sendMistralMessage,
  sendCohereMessage
} from "./api/providerApis";
import type { ChatMessage } from "./types";

export { APIError };

export const fetchModels = async (provider: Provider): Promise<any> => {
  const apiKey = localStorage.getItem(`${provider.id}_api_key`);
  if (!apiKey) {
    throw new APIError("API key not found");
  }

  console.log(`Fetching models for provider: ${provider.id}`);

  try {
    switch (provider.id) {
      case "google":
        return fetchGoogleModels(apiKey);
      case "openrouter":
        return fetchOpenRouterModels(apiKey);
      case "openai":
        return fetchOpenAIModels(apiKey);
      case "anthropic":
        return fetchAnthropicModels(apiKey);
      case "mistral":
        return fetchMistralModels(apiKey);
      case "cohere":
        return fetchCohereModels(apiKey);
      case "cloudflare":
        return fetchCloudflareModels(apiKey);
      default:
        throw new APIError("Provider not supported");
    }
  } catch (error) {
    console.error(`Error fetching models for ${provider.id}:`, error);
    throw error instanceof APIError ? error : new APIError("Failed to fetch models from provider");
  }
};

export const sendMessage = async (
  provider: Provider,
  modelId: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<any> => {
  const apiKey = localStorage.getItem(`${provider.id}_api_key`);
  if (!apiKey) {
    throw new APIError("API key not found. Please configure the provider first.");
  }

  console.log(`Sending message to ${provider.name} using model ${modelId}`);

  try {
    switch (provider.id) {
      case "google":
        return sendGoogleMessage(apiKey, modelId, messages);
      case "openrouter":
        return sendOpenRouterMessage(apiKey, modelId, messages, signal);
      case "openai":
        return sendOpenAIMessage(apiKey, modelId, messages, signal);
      case "anthropic":
        return sendAnthropicMessage(apiKey, modelId, messages, signal);
      case "mistral":
        return sendMistralMessage(apiKey, modelId, messages, signal);
      case "cohere":
        return sendCohereMessage(apiKey, modelId, messages, signal);
      case "cloudflare":
        return sendCloudflareMessage(apiKey, modelId, messages, signal);
      default:
        throw new APIError("Provider not supported");
    }
  } catch (error) {
    console.error(`API Error with ${provider.id}:`, error);
    throw error instanceof APIError ? error : new APIError("Failed to send message to provider");
  }
};