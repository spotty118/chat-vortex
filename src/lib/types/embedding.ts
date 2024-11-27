export interface Document {
  id: string;
  content: string;
  embedding?: number[];
  metadata: {
    source?: string;
    [key: string]: any;
  };
}

export interface SearchResult {
  document: Document;
  score: number;
  relevance: number;
}

export interface EmbeddingVector {
  vector: number[];
  text: string;
  metadata?: Record<string, any>;
}

export interface EmbeddingResult {
  vectors: EmbeddingVector[];
  metadata?: Record<string, any>;
}