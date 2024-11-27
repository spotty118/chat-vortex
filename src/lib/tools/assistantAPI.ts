import { Tool } from '../types/tools';
import { OpenAIClient } from '../api/openai';

interface Assistant {
  id: string;
  name: string;
  instructions: string;
  tools: string[];
  model: string;
}

interface Thread {
  id: string;
  messages: any[];
  metadata: any;
}

export const assistantAPITool: Tool = {
  name: "assistantAPI",
  description: "Interact with OpenAI's Assistant API",
  parameters: {
    action: {
      type: "string",
      description: "Action to perform",
      enum: [
        "createAssistant",
        "listAssistants",
        "getAssistant",
        "deleteAssistant",
        "createThread",
        "getThread",
        "addMessage",
        "runAssistant"
      ]
    },
    apiKey: {
      type: "string",
      description: "OpenAI API key"
    },
    assistantId: {
      type: "string",
      description: "Assistant ID for specific operations"
    },
    threadId: {
      type: "string",
      description: "Thread ID for specific operations"
    },
    config: {
      type: "object",
      description: "Configuration for creating assistants or sending messages",
      properties: {
        name: { type: "string" },
        instructions: { type: "string" },
        tools: { type: "array", items: { type: "string" } },
        model: { type: "string" },
        message: { type: "string" },
        fileIds: { type: "array", items: { type: "string" } }
      }
    }
  },
  required: ["action", "apiKey"],
  handler: async (args) => {
    const { action, apiKey, assistantId, threadId, config = {} } = args;
    const client = new OpenAIClient(apiKey);

    try {
      switch (action) {
        case "createAssistant": {
          if (!config.name || !config.instructions || !config.model) {
            throw new Error("Missing required configuration for assistant creation");
          }

          const assistant = await client.beta.assistants.create({
            name: config.name,
            instructions: config.instructions,
            tools: config.tools?.map(tool => ({ type: tool })) || [],
            model: config.model
          });

          return {
            success: true,
            assistant: {
              id: assistant.id,
              name: assistant.name,
              instructions: assistant.instructions,
              model: assistant.model
            }
          };
        }

        case "listAssistants": {
          const assistants = await client.beta.assistants.list();
          return {
            success: true,
            assistants: assistants.data.map(a => ({
              id: a.id,
              name: a.name,
              instructions: a.instructions,
              model: a.model
            }))
          };
        }

        case "getAssistant": {
          if (!assistantId) {
            throw new Error("Assistant ID is required");
          }

          const assistant = await client.beta.assistants.retrieve(assistantId);
          return {
            success: true,
            assistant: {
              id: assistant.id,
              name: assistant.name,
              instructions: assistant.instructions,
              model: assistant.model
            }
          };
        }

        case "deleteAssistant": {
          if (!assistantId) {
            throw new Error("Assistant ID is required");
          }

          await client.beta.assistants.del(assistantId);
          return {
            success: true,
            message: `Assistant ${assistantId} deleted successfully`
          };
        }

        case "createThread": {
          const thread = await client.beta.threads.create({});
          return {
            success: true,
            threadId: thread.id
          };
        }

        case "getThread": {
          if (!threadId) {
            throw new Error("Thread ID is required");
          }

          const thread = await client.beta.threads.retrieve(threadId);
          const messages = await client.beta.threads.messages.list(threadId);

          return {
            success: true,
            thread: {
              id: thread.id,
              messages: messages.data,
              metadata: thread.metadata
            }
          };
        }

        case "addMessage": {
          if (!threadId || !config.message) {
            throw new Error("Thread ID and message are required");
          }

          const message = await client.beta.threads.messages.create(threadId, {
            role: "user",
            content: config.message,
            file_ids: config.fileIds || []
          });

          return {
            success: true,
            message: {
              id: message.id,
              role: message.role,
              content: message.content
            }
          };
        }

        case "runAssistant": {
          if (!threadId || !assistantId) {
            throw new Error("Thread ID and Assistant ID are required");
          }

          const run = await client.beta.threads.runs.create(threadId, {
            assistant_id: assistantId
          });

          // Poll for completion
          let completedRun = await pollRunCompletion(client, threadId, run.id);

          // Get messages after completion
          const messages = await client.beta.threads.messages.list(threadId);

          return {
            success: true,
            run: {
              id: completedRun.id,
              status: completedRun.status,
              messages: messages.data
            }
          };
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      throw new Error(`Assistant API error: ${error.message}`);
    }
  }
};

async function pollRunCompletion(client: any, threadId: string, runId: string) {
  const maxAttempts = 10;
  const delayMs = 1000;
  
  for (let i = 0; i < maxAttempts; i++) {
    const run = await client.beta.threads.runs.retrieve(threadId, runId);
    
    if (run.status === 'completed') {
      return run;
    }
    
    if (run.status === 'failed' || run.status === 'cancelled') {
      throw new Error(`Run ${runId} ${run.status}: ${run.last_error?.message || 'Unknown error'}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error('Run timed out');
}
