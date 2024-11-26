import { Tool } from '../types/tools';

interface RateLimit {
  requests: number;
  tokens: number;
  interval: number; // in milliseconds
}

interface ProviderLimits {
  [key: string]: RateLimit;
}

// Default rate limits for each provider
const defaultLimits: ProviderLimits = {
  openai: {
    requests: 500,
    tokens: 100000,
    interval: 60000 // 1 minute
  },
  anthropic: {
    requests: 300,
    tokens: 50000,
    interval: 60000
  },
  google: {
    requests: 600,
    tokens: 120000,
    interval: 60000
  },
  mistral: {
    requests: 500,
    tokens: 100000,
    interval: 60000
  },
  openrouter: {
    requests: 60,
    tokens: 50000,
    interval: 60000
  },
  cloudflare: {
    requests: 1000,
    tokens: 150000,
    interval: 60000
  }
};

// Track usage for each provider
const usage = new Map<string, {
  requests: number;
  tokens: number;
  lastReset: number;
}>();

export const rateLimitsTool: Tool = {
  name: "rateLimits",
  description: "Manage and monitor API rate limits",
  parameters: {
    action: {
      type: "string",
      description: "Action to perform",
      enum: ["check", "update", "reset", "getUsage"]
    },
    provider: {
      type: "string",
      description: "Provider to manage limits for",
      enum: Object.keys(defaultLimits)
    },
    limits: {
      type: "object",
      description: "New limits to set (for update action)",
      properties: {
        requests: { type: "number" },
        tokens: { type: "number" },
        interval: { type: "number" }
      }
    }
  },
  required: ["action", "provider"],
  handler: async (args) => {
    const { action, provider, limits } = args;

    // Initialize usage if not exists
    if (!usage.has(provider)) {
      usage.set(provider, {
        requests: 0,
        tokens: 0,
        lastReset: Date.now()
      });
    }

    const currentUsage = usage.get(provider)!;
    const currentLimits = defaultLimits[provider];

    // Check if we need to reset usage based on interval
    const now = Date.now();
    if (now - currentUsage.lastReset >= currentLimits.interval) {
      currentUsage.requests = 0;
      currentUsage.tokens = 0;
      currentUsage.lastReset = now;
    }

    switch (action) {
      case "check": {
        const remaining = {
          requests: currentLimits.requests - currentUsage.requests,
          tokens: currentLimits.tokens - currentUsage.tokens
        };

        return {
          success: true,
          provider,
          limits: currentLimits,
          usage: currentUsage,
          remaining,
          resetIn: currentLimits.interval - (now - currentUsage.lastReset)
        };
      }

      case "update": {
        if (!limits) {
          throw new Error("Limits object required for update action");
        }

        Object.assign(defaultLimits[provider], limits);
        return {
          success: true,
          provider,
          message: "Rate limits updated successfully",
          newLimits: defaultLimits[provider]
        };
      }

      case "reset": {
        usage.set(provider, {
          requests: 0,
          tokens: 0,
          lastReset: now
        });

        return {
          success: true,
          provider,
          message: "Usage reset successfully"
        };
      }

      case "getUsage": {
        return {
          success: true,
          provider,
          usage: currentUsage,
          limits: currentLimits
        };
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
};

// Utility function to increment usage
export function incrementUsage(provider: string, requests = 1, tokens = 0) {
  const currentUsage = usage.get(provider);
  if (!currentUsage) {
    return false;
  }

  currentUsage.requests += requests;
  currentUsage.tokens += tokens;
  return true;
}

// Utility function to check if operation would exceed limits
export function checkLimit(provider: string, requestCount = 1, tokenCount = 0): boolean {
  const currentUsage = usage.get(provider);
  const limits = defaultLimits[provider];

  if (!currentUsage || !limits) {
    return false;
  }

  return (
    currentUsage.requests + requestCount <= limits.requests &&
    currentUsage.tokens + tokenCount <= limits.tokens
  );
}
