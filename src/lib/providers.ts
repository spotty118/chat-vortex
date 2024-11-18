import { Provider } from "./types";

export const providers: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    logo: "/placeholder.svg",
    models: [
      {
        id: "gpt-4",
        name: "GPT-4",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.03,
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        capabilities: ["chat", "code"],
        tokenCost: 0.002,
      },
    ],
    latency: 250,
    tps: 10,
    status: "online",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    logo: "/placeholder.svg",
    models: [
      {
        id: "claude-2",
        name: "Claude 2",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.025,
      },
    ],
    latency: 300,
    tps: 8,
    status: "online",
  },
  {
    id: "google",
    name: "Google AI",
    logo: "/placeholder.svg",
    models: [
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        capabilities: ["chat", "code", "analysis", "vision"],
        tokenCost: 0.01,
      },
      {
        id: "gemini-ultra",
        name: "Gemini Ultra",
        capabilities: ["chat", "code", "analysis", "vision", "reasoning"],
        tokenCost: 0.03,
      },
    ],
    latency: 200,
    tps: 15,
    status: "online",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    logo: "/placeholder.svg",
    models: [
      {
        id: "mistral-medium",
        name: "Mistral Medium",
        capabilities: ["chat", "code"],
        tokenCost: 0.002,
      },
      {
        id: "mixtral-8x7b",
        name: "Mixtral 8x7B",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.004,
      },
    ],
    latency: 280,
    tps: 12,
    status: "online",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    logo: "/placeholder.svg",
    models: [
      {
        id: "mistral-tiny",
        name: "Mistral Tiny",
        capabilities: ["chat"],
        tokenCost: 0.001,
      },
      {
        id: "mistral-small",
        name: "Mistral Small",
        capabilities: ["chat", "code"],
        tokenCost: 0.002,
      },
      {
        id: "mistral-medium",
        name: "Mistral Medium",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.004,
      },
    ],
    latency: 220,
    tps: 10,
    status: "online",
  },
  {
    id: "cohere",
    name: "Cohere",
    logo: "/placeholder.svg",
    models: [
      {
        id: "command",
        name: "Command",
        capabilities: ["chat", "analysis"],
        tokenCost: 0.002,
      },
      {
        id: "command-light",
        name: "Command Light",
        capabilities: ["chat"],
        tokenCost: 0.001,
      },
    ],
    latency: 270,
    tps: 8,
    status: "online",
  }
];