import { useState, useCallback } from 'react';
import { Document, SearchResult } from '@/lib/types/embedding';

interface RAGOptions {
  similarityThreshold?: number;
  maxResults?: number;
  minRelevance?: number;
}

// Simple cosine similarity between two vectors
const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;
  
  const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  return dotProduct / (magnitudeA * magnitudeB);
};

export const useRAG = (options: RAGOptions = {}) => {
  const {
    similarityThreshold = 0.7,
    maxResults = 5,
    minRelevance = 0.5
  } = options;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);

  // Add documents to the RAG system
  const addDocuments = useCallback(async (
    newDocs: Array<Omit<Document, 'embedding'>>
  ) => {
    setIsIndexing(true);
    try {
      // In a real implementation, we would use a proper embedding model
      // For now, we'll create random embeddings for demonstration
      const docsWithEmbeddings: Document[] = newDocs.map(doc => ({
        ...doc,
        embedding: Array.from(
          { length: 384 },
          () => Math.random() * 2 - 1
        )
      }));

      setDocuments(prev => [...prev, ...docsWithEmbeddings]);
    } finally {
      setIsIndexing(false);
    }
  }, []);

  // Remove documents from the RAG system
  const removeDocuments = useCallback((ids: string[]) => {
    setDocuments(prev => 
      prev.filter(doc => !ids.includes(doc.id))
    );
  }, []);

  // Search for relevant documents
  const searchDocuments = useCallback(async (
    query: string,
    customOptions?: Partial<RAGOptions>
  ): Promise<SearchResult[]> => {
    const opts = { ...options, ...customOptions };

    // In a real implementation, we would get the query embedding from an API
    const queryEmbedding = Array.from(
      { length: 384 },
      () => Math.random() * 2 - 1
    );

    const results: SearchResult[] = documents
      .map(doc => ({
        document: doc,
        score: doc.embedding ? cosineSimilarity(queryEmbedding, doc.embedding) : 0,
        relevance: Math.random() // In real implementation, calculate based on content
      }))
      .filter(result => 
        result.score >= opts.similarityThreshold! &&
        result.relevance >= opts.minRelevance!
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, opts.maxResults);

    return results;
  }, [documents, options]);

  // Generate context from search results
  const generateContext = useCallback((
    results: SearchResult[],
    maxTokens: number = 1000
  ): string => {
    let context = '';
    let estimatedTokens = 0;
    const TOKENS_PER_CHAR = 0.25;

    for (const result of results) {
      const docTokens = result.document.content.length * TOKENS_PER_CHAR;
      if (estimatedTokens + docTokens > maxTokens) break;

      context += `
[Source: ${result.document.metadata.source || 'Unknown'}]
${result.document.content}
---
`;
      estimatedTokens += docTokens;
    }

    return context.trim();
  }, []);

  return {
    documents,
    isIndexing,
    addDocuments,
    removeDocuments,
    searchDocuments,
    generateContext,
  };
};
