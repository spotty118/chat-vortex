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
];