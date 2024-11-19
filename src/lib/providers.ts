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
      {
        id: "claude-instant-1",
        name: "Claude Instant",
        capabilities: ["chat", "code"],
        tokenCost: 0.008,
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
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.01,
      },
      {
        id: "gemini-pro-vision",
        name: "Gemini Pro Vision",
        capabilities: ["chat", "code", "vision"],
        tokenCost: 0.02,
      },
    ],
    latency: 200,
    tps: 15,
    status: "online",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    logo: "/placeholder.svg",
    models: [
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
        tokenCost: 0.006,
      },
      {
        id: "mistral-large",
        name: "Mistral Large",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.012,
      },
    ],
    latency: 180,
    tps: 20,
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
    id: "cohere",
    name: "Cohere",
    logo: "/placeholder.svg",
    models: [
      {
        id: "command",
        name: "Command",
        capabilities: ["chat", "code"],
        tokenCost: 0.003,
      },
      {
        id: "command-light",
        name: "Command Light",
        capabilities: ["chat"],
        tokenCost: 0.001,
      },
    ],
    latency: 220,
    tps: 10,
    status: "online",
  }
];