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
        capabilities: ["chat", "code", "analysis", "attachments", "function_calling", "json_mode", "streaming"],
        tokenCost: 0.01,
        contextWindow: 128000,
        maxOutputTokens: 4096,
        inputFormats: ["text", "image"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "0128",
        releaseDate: "2024-01-28",
        pricing: {
          prompt: 0.01,
          completion: 0.03
        }
      },
      {
        id: "gpt-4-vision-preview",
        name: "GPT-4 Vision",
        provider: "openai",
        capabilities: ["chat", "vision", "analysis"],
        tokenCost: 0.01,
        contextWindow: 128000,
        maxOutputTokens: 4096,
        inputFormats: ["text", "image"],
        outputFormats: ["text"],
        temperature: 0.7,
        streamingSupport: true,
        version: "0125",
        pricing: {
          prompt: 0.01,
          completion: 0.03
        }
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        capabilities: ["chat", "code", "function_calling", "json_mode", "streaming"],
        tokenCost: 0.0015,
        contextWindow: 16385,
        maxOutputTokens: 4096,
        inputFormats: ["text"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "0125",
        pricing: {
          prompt: 0.0015,
          completion: 0.002
        }
      },
      {
        id: "dall-e-3",
        name: "DALL-E 3",
        provider: "openai",
        capabilities: ["image_generation"],
        tokenCost: 0.04,
        contextWindow: 4096,
        inputFormats: ["text"],
        outputFormats: ["image"],
        streamingSupport: false,
        version: "3",
        pricing: {
          prompt: 0.04,
          completion: 0.04
        }
      }
    ],
    status: "online",
    features: {
      functionCalling: true,
      toolUse: true,
      parallelRequests: true,
      customInstructions: true,
      modelFinetuning: true,
      assistantAPI: true,
      rateLimits: {
        requestsPerMinute: 500,
        tokensPerMinute: 100000
      }
    },
    documentation: "https://platform.openai.com/docs",
    apiVersion: "v1"
  },
  {
    id: "anthropic",
    name: "Anthropic",
    logo: "https://avatars.githubusercontent.com/u/124916566?s=200&v=4",
    description: "AI safety-focused company with Claude, a highly capable and ethical AI assistant.",
    models: [
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        provider: "anthropic",
        capabilities: ["chat", "code", "analysis", "vision", "function_calling"],
        tokenCost: 0.015,
        contextWindow: 200000,
        maxOutputTokens: 4096,
        inputFormats: ["text", "image"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "3.0",
        releaseDate: "2024-03-04",
        pricing: {
          prompt: 0.015,
          completion: 0.075
        }
      },
      {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        provider: "anthropic",
        capabilities: ["chat", "code", "analysis", "vision"],
        tokenCost: 0.003,
        contextWindow: 200000,
        maxOutputTokens: 4096,
        inputFormats: ["text", "image"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "3.0",
        releaseDate: "2024-03-04",
        pricing: {
          prompt: 0.003,
          completion: 0.015
        }
      }
    ],
    status: "online",
    features: {
      functionCalling: true,
      toolUse: true,
      parallelRequests: true,
      customInstructions: true,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 300,
        tokensPerMinute: 50000
      }
    },
    documentation: "https://docs.anthropic.com/claude/docs"
  },
  {
    id: "google",
    name: "Google AI",
    logo: "https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg",
    description: "Google's AI research and development division, offering advanced language models like Gemini.",
    models: [
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        provider: "google",
        capabilities: ["chat", "code", "analysis", "function_calling"],
        tokenCost: 0.00025,
        contextWindow: 32768,
        maxOutputTokens: 2048,
        inputFormats: ["text"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "1.0",
        pricing: {
          prompt: 0.00025,
          completion: 0.0005
        }
      },
      {
        id: "gemini-pro-vision",
        name: "Gemini Pro Vision",
        provider: "google",
        capabilities: ["chat", "vision", "analysis"],
        tokenCost: 0.00025,
        contextWindow: 32768,
        maxOutputTokens: 2048,
        inputFormats: ["text", "image"],
        outputFormats: ["text"],
        temperature: 0.7,
        streamingSupport: true,
        version: "1.0",
        pricing: {
          prompt: 0.00025,
          completion: 0.0005
        }
      }
    ],
    status: "online",
    features: {
      functionCalling: true,
      toolUse: true,
      parallelRequests: true,
      customInstructions: false,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 600,
        tokensPerMinute: 120000
      }
    },
    documentation: "https://ai.google.dev/docs"
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    logo: "https://openrouter.ai/favicon.ico",
    description: "Meta-platform providing access to various AI models with unified pricing and API.",
    models: [
      {
        id: "openai/gpt-4-turbo",
        name: "GPT-4 Turbo",
        provider: "openrouter",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.01,
        contextWindow: 128000,
        maxOutputTokens: 4096,
        inputFormats: ["text"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "0125",
        pricing: {
          prompt: 0.01,
          completion: 0.03
        }
      },
      {
        id: "anthropic/claude-3-opus",
        name: "Claude 3 Opus",
        provider: "openrouter",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.015,
        contextWindow: 200000,
        maxOutputTokens: 4096,
        inputFormats: ["text"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "3.0",
        pricing: {
          prompt: 0.015,
          completion: 0.075
        }
      }
    ],
    status: "online",
    features: {
      functionCalling: false,
      toolUse: false,
      parallelRequests: true,
      customInstructions: false,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 50000
      }
    },
    documentation: "https://openrouter.ai/docs"
  },
  {
    id: "mistral",
    name: "Mistral AI",
    logo: "https://mistral.ai/favicon.ico",
    description: "European AI company focused on efficient and powerful language models.",
    models: [
      {
        id: "mistral-large-latest",
        name: "Mistral Large",
        provider: "mistral",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.008,
        contextWindow: 32768,
        maxOutputTokens: 4096,
        inputFormats: ["text"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "latest",
        pricing: {
          prompt: 0.008,
          completion: 0.024
        }
      },
      {
        id: "mistral-medium-latest",
        name: "Mistral Medium",
        provider: "mistral",
        capabilities: ["chat", "code"],
        tokenCost: 0.002,
        contextWindow: 32768,
        maxOutputTokens: 4096,
        inputFormats: ["text"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "latest",
        pricing: {
          prompt: 0.002,
          completion: 0.006
        }
      },
      {
        id: "mistral-small-latest",
        name: "Mistral Small",
        provider: "mistral",
        capabilities: ["chat", "code"],
        tokenCost: 0.0002,
        contextWindow: 32768,
        maxOutputTokens: 4096,
        inputFormats: ["text"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "latest",
        pricing: {
          prompt: 0.0002,
          completion: 0.0006
        }
      }
    ],
    status: "online",
    features: {
      functionCalling: false,
      toolUse: false,
      parallelRequests: true,
      customInstructions: false,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 500,
        tokensPerMinute: 100000
      }
    },
    documentation: "https://docs.mistral.ai/"
  },
  {
    id: "cloudflare",
    name: "Cloudflare AI",
    logo: "https://developers.cloudflare.com/favicon.ico",
    description: "Edge AI platform by Cloudflare, offering fast and globally distributed AI inference.",
    models: [
      {
        id: "gpt-4",
        name: "GPT-4",
        provider: "cloudflare",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.01,
        contextWindow: 8192,
        maxOutputTokens: 4096,
        inputFormats: ["text"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "1.0",
        pricing: {
          prompt: 0.01,
          completion: 0.03
        }
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "cloudflare",
        capabilities: ["chat", "code"],
        tokenCost: 0.0015,
        contextWindow: 4096,
        maxOutputTokens: 4096,
        inputFormats: ["text"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "1.0",
        pricing: {
          prompt: 0.0015,
          completion: 0.002
        }
      }
    ],
    status: "online",
    features: {
      functionCalling: false,
      toolUse: false,
      parallelRequests: true,
      customInstructions: false,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 1000,
        tokensPerMinute: 150000
      }
    },
    documentation: "https://developers.cloudflare.com/ai-gateway/"
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    logo: "https://www.perplexity.ai/favicon.ico",
    description: "Specialized in online information retrieval and analysis with real-time web access.",
    models: [
      {
        id: "pplx-14",
        name: "PPLX 14B",
        provider: "perplexity",
        capabilities: ["chat", "analysis", "function_calling"],
        tokenCost: 0.0004,
        contextWindow: 8192,
        maxOutputTokens: 4096,
        inputFormats: ["text"],
        outputFormats: ["text"],
        temperature: 0.7,
        streamingSupport: true,
        version: "1.0",
        pricing: {
          prompt: 0.0004,
          completion: 0.0012
        }
      }
    ],
    status: "online",
    features: {
      functionCalling: true,
      toolUse: true,
      parallelRequests: true,
      customInstructions: false,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 300,
        tokensPerMinute: 50000
      }
    },
    documentation: "https://docs.perplexity.ai/"
  },
  {
    id: "groq",
    name: "Groq",
    logo: "https://groq.com/favicon.ico",
    description: "High-performance AI inference platform with ultra-low latency.",
    models: [
      {
        id: "mixtral-8x7b",
        name: "Mixtral 8x7B",
        provider: "groq",
        capabilities: ["chat", "code", "analysis"],
        tokenCost: 0.0002,
        contextWindow: 32768,
        maxOutputTokens: 4096,
        inputFormats: ["text"],
        outputFormats: ["text", "code"],
        temperature: 0.7,
        streamingSupport: true,
        version: "1.0",
        pricing: {
          prompt: 0.0002,
          completion: 0.0002
        }
      }
    ],
    status: "online",
    features: {
      functionCalling: false,
      toolUse: false,
      parallelRequests: true,
      customInstructions: false,
      modelFinetuning: false,
      assistantAPI: false,
      rateLimits: {
        requestsPerMinute: 1000,
        tokensPerMinute: 200000
      }
    },
    documentation: "https://console.groq.com/docs"
  }
];
