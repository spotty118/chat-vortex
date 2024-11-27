export interface EmbeddingVector {
  vector: number[];
  text: string;
  metadata?: Record<string, any>;
}

export interface EmbeddingResult {
  vectors: EmbeddingVector[];
  metadata?: Record<string, any>;
}