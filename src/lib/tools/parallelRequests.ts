import { Tool } from '../types/tools';
import axios, { AxiosRequestConfig } from 'axios';

interface RequestConfig extends AxiosRequestConfig {
  id?: string;
  name?: string;
}

export const parallelRequestsTool: Tool = {
  name: "parallelRequests",
  description: "Make multiple API requests in parallel",
  parameters: {
    requests: {
      type: "array",
      description: "Array of request configurations",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Optional request identifier" },
          name: { type: "string", description: "Optional request name" },
          url: { type: "string", description: "Request URL" },
          method: { 
            type: "string", 
            enum: ["GET", "POST", "PUT", "DELETE"],
            default: "GET"
          },
          headers: { 
            type: "object", 
            description: "Request headers",
            additionalProperties: true
          },
          data: { 
            type: "object", 
            description: "Request body for POST/PUT methods",
            additionalProperties: true
          },
          params: {
            type: "object",
            description: "Query parameters",
            additionalProperties: true
          }
        },
        required: ["url"]
      }
    },
    timeout: {
      type: "number",
      description: "Timeout in milliseconds for each request",
      default: 30000
    },
    retries: {
      type: "number",
      description: "Number of retry attempts for failed requests",
      default: 3
    }
  },
  required: ["requests"],
  handler: async (args) => {
    const { requests, timeout = 30000, retries = 3 } = args;

    // Helper function to retry failed requests
    const retryRequest = async (config: RequestConfig, attemptCount: number = 0): Promise<any> => {
      try {
        const response = await axios({
          ...config,
          timeout,
          validateStatus: null // Don't throw on any status code
        });

        return {
          id: config.id,
          name: config.name,
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers
        };
      } catch (error) {
        if (attemptCount < retries) {
          // Exponential backoff
          const delay = Math.pow(2, attemptCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return retryRequest(config, attemptCount + 1);
        }
        
        return {
          id: config.id,
          name: config.name,
          error: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        };
      }
    };

    try {
      // Process all requests in parallel with retry logic
      const results = await Promise.all(
        requests.map(config => retryRequest(config))
      );

      // Group results by success/failure
      const successful = results.filter(r => !r.error);
      const failed = results.filter(r => r.error);

      return {
        success: true,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length
        },
        results: {
          successful,
          failed
        }
      };
    } catch (error) {
      throw new Error(`Error processing parallel requests: ${error.message}`);
    }
  }
};
