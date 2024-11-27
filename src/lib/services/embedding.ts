import { OpenAIClient } from '@/lib/api/openai';
import { Document as EmbeddingDocument } from '@/lib/types/embedding';
import type { EmbeddingRequest } from '@/lib/types/embedding';

export class EmbeddingService {
  private client: OpenAIClient;
  private model: string;

  constructor(apiKey: string, model: string = 'text-embedding-3-small') {
    this.client = new OpenAIClient(apiKey);
    this.model = model;
  }

  async embedDocuments(
    documents: Array<Omit<EmbeddingDocument, 'embedding'>>,
    signal?: AbortSignal
  ): Promise<EmbeddingDocument[]> {
    const batches: Array<Omit<EmbeddingDocument, 'embedding'>[]> = [];
    const batchSize = 100; // OpenAI's recommended batch size

    // Split documents into batches
    for (let i = 0; i < documents.length; i += batchSize) {
      batches.push(documents.slice(i, i + batchSize));
    }

    const results: EmbeddingDocument[] = [];

    // Process batches sequentially to avoid rate limits
    for (const batch of batches) {
      const request: EmbeddingRequest = {
        model: this.model,
        input: batch.map(doc => doc.content),
      };

      try {
        const response = await this.client.createEmbedding(request, signal);
        
        batch.forEach((doc, index) => {
          results.push({
            ...doc,
            embedding: response.data[index].embedding,
          });
        });
      } catch (error) {
        console.error('Error creating embeddings:', error);
        throw error;
      }
    }

    return results;
  }

  async embedQuery(
    query: string,
    signal?: AbortSignal
  ): Promise<number[]> {
    const request: EmbeddingRequest = {
      model: this.model,
      input: query,
    };

    try {
      const response = await this.client.createEmbedding(request, signal);
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating query embedding:', error);
      throw error;
    }
  }

  async findSimilar(
    query: string,
    documents: EmbeddingDocument[],
    options: {
      maxResults?: number;
      minScore?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<Array<{ document: EmbeddingDocument; score: number }>> {
    const {
      maxResults = 5,
      minScore = 0.7,
      signal,
    } = options;

    let queryEmbedding: number[];
    if (typeof query === 'string') {
      queryEmbedding = await this.embedQuery(query, signal);
    } else {
      throw new Error('Query must be a string');
    }

    const results = documents
      .map(doc => ({
        document: doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding),
      }))
      .filter(result => result.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return results;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (magnitudeA * magnitudeB);
  }
}
