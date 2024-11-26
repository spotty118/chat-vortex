import { Provider } from "./types";

export const providers: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    description: "Leading AI research company known for advanced language models like GPT-4 and ChatGPT.",
    models: [
      {
        id: "gpt-4-turbo-preview",
        name: "GPT-4 Turbo",
        provider: "openai",
        capabilities: ["chat", "code", "analysis", "streaming"],
        contextWindow: 128000,
        maxOutputTokens: 4096,
        streamingSupport: true,
        version: "0128",
        pricing: {
          prompt: 0.01,
          completion: 0.03
        }
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        capabilities: ["chat", "code", "streaming"],
        contextWindow: 16385,
        maxOutputTokens: 4096,
        streamingSupport: true,
        version: "0125",
        pricing: {
          prompt: 0.0005,
          completion: 0.0015
        }
      }
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    logo: "https://www.anthropic.com/favicon.ico",
    description: "AI research company focused on developing safe and ethical AI systems.",
    models: [
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        provider: "anthropic",
        capabilities: ["chat", "code", "analysis", "streaming"],
        contextWindow: 200000,
        maxOutputTokens: 4096,
        streamingSupport: true,
        version: "opus-20240229",
        pricing: {
          prompt: 0.015,
          completion: 0.075
        }
      },
      {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        provider: "anthropic",
        capabilities: ["chat", "code", "analysis", "streaming"],
        contextWindow: 200000,
        maxOutputTokens: 4096,
        streamingSupport: true,
        version: "sonnet-20240229",
        pricing: {
          prompt: 0.003,
          completion: 0.015
        }
      }
    ]
  },
  {
    id: "google",
    name: "Google AI",
    logo: "https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg",
    description: "Google's AI research division, offering advanced language models like Gemini.",
    models: [
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        provider: "google",
        capabilities: ["chat", "code", "analysis", "streaming"],
        contextWindow: 32768,
        maxOutputTokens: 2048,
        streamingSupport: true,
        version: "latest",
        pricing: {
          prompt: 0.00025,
          completion: 0.0005
        }
      }
    ]
  }
];
