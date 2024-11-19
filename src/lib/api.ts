import { Provider } from "./types";
import { fetchGoogleModels, sendGoogleMessage } from "./api/googleApi";
import { fetchOpenRouterModels, sendOpenRouterMessage } from "./api/openRouterApi";
import { APIError } from "./errors";

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
        const responseOpenAI = await fetch("https://api.openai.com/v1/models", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!responseOpenAI.ok) {
          throw new APIError(`Failed to fetch models: ${responseOpenAI.statusText}`);
        }

        const dataOpenAI = await responseOpenAI.json();
        console.log(`Successfully fetched models for OpenAI:`, dataOpenAI);
        return dataOpenAI.models;

      case "anthropic":
        const responseAnthropic = await fetch("https://api.anthropic.com/v1/models", {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
        });

        if (!responseAnthropic.ok) {
          throw new APIError(`Failed to fetch models: ${responseAnthropic.statusText}`);
        }

        const dataAnthropic = await responseAnthropic.json();
        console.log(`Successfully fetched models for Anthropic:`, dataAnthropic);
        return dataAnthropic.models;

      case "mistral":
        const responseMistral = await fetch("https://api.mistral.ai/v1/models", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!responseMistral.ok) {
          throw new APIError(`Failed to fetch models: ${responseMistral.statusText}`);
        }

        const dataMistral = await responseMistral.json();
        console.log(`Successfully fetched models for Mistral:`, dataMistral);
        return dataMistral.models;

      case "cohere":
        const responseCohere = await fetch("https://api.cohere.ai/v1/models", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!responseCohere.ok) {
          throw new APIError(`Failed to fetch models: ${responseCohere.statusText}`);
        }

        const dataCohere = await responseCohere.json();
        console.log(`Successfully fetched models for Cohere:`, dataCohere);
        return dataCohere.models;

      default:
        throw new APIError("Provider not supported for model fetching");
    }
  } catch (error) {
    console.error(`Error fetching models for ${provider.id}:`, error);
    throw error instanceof APIError ? error : new APIError("Failed to fetch models from provider");
  }
};

export const sendMessage = async (
  provider: Provider,
  modelId: string,
  messages: any[]
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
        return sendOpenRouterMessage(apiKey, modelId, messages);
      case "openai":
        const responseOpenAI = await fetch("https://api.openai.com/v1/chat/completions", {
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

        if (!responseOpenAI.ok) {
          const errorText = await responseOpenAI.text();
          console.error(`API Error response from OpenAI:`, errorText);
          throw new APIError(`API request failed: ${responseOpenAI.statusText}`);
        }

        const dataOpenAI = await responseOpenAI.json();
        console.log(`API Response from OpenAI:`, dataOpenAI);

        return {
          message: dataOpenAI.choices[0].message.content,
          usage: dataOpenAI.usage,
        };

      case "anthropic":
        const responseAnthropic = await fetch("https://api.anthropic.com/v1/messages", {
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

        if (!responseAnthropic.ok) {
          const errorText = await responseAnthropic.text();
          console.error(`API Error response from Anthropic:`, errorText);
          throw new APIError(`API request failed: ${responseAnthropic.statusText}`);
        }

        const dataAnthropic = await responseAnthropic.json();
        console.log(`API Response from Anthropic:`, dataAnthropic);

        return {
          message: dataAnthropic.content[0].text,
          usage: dataAnthropic.usage,
        };

      case "mistral":
        const responseMistral = await fetch("https://api.mistral.ai/v1/chat/completions", {
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

        if (!responseMistral.ok) {
          const errorText = await responseMistral.text();
          console.error(`API Error response from Mistral:`, errorText);
          throw new APIError(`API request failed: ${responseMistral.statusText}`);
        }

        const dataMistral = await responseMistral.json();
        console.log(`API Response from Mistral:`, dataMistral);

        return {
          message: dataMistral.choices[0].message.content,
          usage: dataMistral.usage,
        };

      case "cohere":
        const responseCohere = await fetch("https://api.cohere.ai/v1/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            prompt: messages[messages.length - 1].content,
            max_tokens: 1000,
          }),
        });

        if (!responseCohere.ok) {
          const errorText = await responseCohere.text();
          console.error(`API Error response from Cohere:`, errorText);
          throw new APIError(`API request failed: ${responseCohere.statusText}`);
        }

        const dataCohere = await responseCohere.json();
        console.log(`API Response from Cohere:`, dataCohere);

        return {
          message: dataCohere.generations[0].text,
          usage: {
            total_tokens: dataCohere.meta.billed_tokens,
          },
        };

      default:
        throw new APIError("Provider not supported");
    }
  } catch (error) {
    console.error(`API Error with ${provider.id}:`, error);
    throw error instanceof APIError ? error : new APIError("Failed to send message to provider");
  }
};
