import { APIError } from "../errors";
import type { ChatMessage } from "../types";

export const fetchOpenAIModels = async (apiKey: string) => {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new APIError(`Failed to fetch models: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Successfully fetched models for OpenAI:`, data);
  return data.data || [];
};

export const fetchAnthropicModels = async (apiKey: string) => {
  const response = await fetch("https://api.anthropic.com/v1/models", {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new APIError(`Failed to fetch models: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Successfully fetched models for Anthropic:`, data);
  return data.data || [];
};

export const fetchMistralModels = async (apiKey: string) => {
  const response = await fetch("https://api.mistral.ai/v1/models", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new APIError(`Failed to fetch models: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Successfully fetched models for Mistral:`, data);
  return data.data || [];
};

export const fetchCohereModels = async (apiKey: string) => {
  const response = await fetch("https://api.cohere.ai/v1/models", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new APIError(`Failed to fetch models: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Successfully fetched models for Cohere:`, data);
  return data.data || [];
};

// Message sending functions with signal parameter
export const sendOpenAIMessage = async (
  apiKey: string, 
  modelId: string, 
  messages: ChatMessage[],
  signal?: AbortSignal
) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: modelId,
      messages: messages,
    }),
  });

  if (!response.ok) {
    throw new APIError(`Failed to send message: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    message: data.choices[0].message.content,
    usage: data.usage,
  };
};

export const sendAnthropicMessage = async (
  apiKey: string, 
  modelId: string, 
  messages: ChatMessage[],
  signal?: AbortSignal
) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    signal,
    body: JSON.stringify({
      model: modelId,
      messages: messages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
    }),
  });

  if (!response.ok) {
    throw new APIError(`Failed to send message: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    message: data.content[0].text,
    usage: data.usage,
  };
};

export const sendMistralMessage = async (
  apiKey: string, 
  modelId: string, 
  messages: ChatMessage[],
  signal?: AbortSignal
) => {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: modelId,
      messages: messages,
    }),
  });

  if (!response.ok) {
    throw new APIError(`Failed to send message: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    message: data.choices[0].message.content,
    usage: data.usage,
  };
};

export const sendCohereMessage = async (
  apiKey: string, 
  modelId: string, 
  messages: ChatMessage[],
  signal?: AbortSignal
) => {
  const response = await fetch("https://api.cohere.ai/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: modelId,
      prompt: messages[messages.length - 1].content
    }),
  });

  if (!response.ok) {
    throw new APIError(`Failed to send message: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    message: data.generations[0].text,
    usage: {
      total_tokens: data.meta.billed_tokens,
    },
  };
};