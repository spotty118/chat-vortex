export interface Document {
  id?: string;
  content: string;
  metadata: {
    title?: string;
    source?: string;
    [key: string]: any;
  };
  embedding: number[];
}

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface SearchResult {
  document: Document;
  score: number;
}
