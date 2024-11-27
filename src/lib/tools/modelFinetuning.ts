import { Tool } from '../types/tools';
import { OpenAIClient } from '../api/openai';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TrainingExample {
  input: string;
  output: string;
  [key: string]: any;
}

interface FinetuningJob {
  id: string;
  model: string;
  status: string;
  createdAt: Date;
  finishedAt?: Date;
  trainingMetrics?: any;
}

export const modelFinetuningTool: Tool = {
  name: "modelFinetuning",
  description: "Finetune AI models on custom data",
  parameters: {
    provider: {
      type: "string",
      description: "AI provider (currently only OpenAI supported)",
      enum: ["openai"]
    },
    baseModel: {
      type: "string",
      description: "Base model to finetune",
      enum: ["gpt-3.5-turbo", "gpt-4", "davinci"]
    },
    trainingData: {
      type: "array",
      description: "Array of training examples",
      items: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "Input text"
          },
          output: {
            type: "string",
            description: "Expected output text"
          }
        },
        required: ["input", "output"]
      }
    },
    validationData: {
      type: "array",
      description: "Optional validation examples",
      items: {
        type: "object",
        properties: {
          input: { type: "string" },
          output: { type: "string" }
        }
      }
    },
    hyperparameters: {
      type: "object",
      description: "Training hyperparameters",
      properties: {
        epochs: {
          type: "number",
          default: 3
        },
        batchSize: {
          type: "number",
          default: 4
        },
        learningRate: {
          type: "number",
          default: 1e-5
        }
      }
    },
    apiKey: {
      type: "string",
      description: "OpenAI API key"
    }
  },
  required: ["provider", "baseModel", "trainingData", "apiKey"],
  handler: async (args) => {
    const { 
      provider, 
      baseModel, 
      trainingData, 
      validationData = [], 
      hyperparameters = {},
      apiKey 
    } = args;

    if (provider !== 'openai') {
      throw new Error('Currently only OpenAI finetuning is supported');
    }

    try {
      const client = new OpenAIClient(apiKey);

      // Prepare training data in JSONL format
      const trainingFile = await prepareTrainingFile(trainingData, 'training');
      const validationFile = validationData.length > 0 
        ? await prepareTrainingFile(validationData, 'validation')
        : null;

      // Upload training files
      const trainingUpload = await client.files.create({
        file: await fs.readFile(trainingFile),
        purpose: 'fine-tune'
      });

      let validationUpload;
      if (validationFile) {
        validationUpload = await client.files.create({
          file: await fs.readFile(validationFile),
          purpose: 'fine-tune'
        });
      }

      // Create finetuning job
      const fineTuneJob = await client.fineTuning.jobs.create({
        training_file: trainingUpload.id,
        validation_file: validationUpload?.id,
        model: baseModel,
        hyperparameters: {
          n_epochs: hyperparameters.epochs || 3,
          batch_size: hyperparameters.batchSize || 4,
          learning_rate_multiplier: hyperparameters.learningRate || 1e-5
        }
      });

      // Clean up temporary files
      await fs.unlink(trainingFile);
      if (validationFile) {
        await fs.unlink(validationFile);
      }

      return {
        success: true,
        jobId: fineTuneJob.id,
        status: fineTuneJob.status,
        model: fineTuneJob.fine_tuned_model,
        message: 'Finetuning job created successfully'
      };
    } catch (error) {
      throw new Error(`Error in finetuning: ${error.message}`);
    }
  }
};

async function prepareTrainingFile(
  data: TrainingExample[],
  type: 'training' | 'validation'
): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp');
  await fs.mkdir(tempDir, { recursive: true });
  
  const filename = path.join(tempDir, `${type}_${Date.now()}.jsonl`);
  
  const jsonlContent = data
    .map(example => JSON.stringify({
      messages: [
        { role: "user", content: example.input },
        { role: "assistant", content: example.output }
      ]
    }))
    .join('\n');

  await fs.writeFile(filename, jsonlContent);
  return filename;
}
