import crypto from 'crypto';
import { Document } from '@/lib/types';
import { Document as EmbeddingDocument } from '@/lib/types/embedding';
import { ChatMessage, MessageWithMetadata } from '@/lib/types/ai';
import { EmbeddingService } from '@/lib/services/embedding';
import { ChatService } from '@/lib/services/chat';

interface RAGOptions {
  maxResults?: number;
  minScore?: number;
  max_tokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export class RAGService {
  private embeddingService: EmbeddingService;
  private chatService: ChatService;
  private documents: Document[];

  constructor(
    openAIKey: string,
    embeddingModel: string = 'text-embedding-3-small'
  ) {
    this.embeddingService = new EmbeddingService(openAIKey, embeddingModel);
    this.chatService = new ChatService();
    this.documents = [];
  }

  async addDocuments(
    documents: Array<Omit<Document, 'embedding'>>,
    signal?: AbortSignal
  ): Promise<void> {
    const embeddedDocs = await this.embeddingService.embedDocuments(
      documents,
      signal
    );
    this.documents.push(...embeddedDocs.map(doc => ({
      id: doc.id || crypto.randomUUID(), // Ensure id is always present
      content: doc.content,
      metadata: doc.metadata,
      embedding: doc.embedding || [] // Ensure embedding is always present
    })));
  }

  async query(
    query: string,
    model: any,
    options: RAGOptions = {}
  ): Promise<ChatMessage> {
    const {
      maxResults = 5,
      minScore = 0.7,
      max_tokens = 1000,
      temperature = 0.7,
      signal,
    } = options;

    // Find relevant documents
    const relevantDocs = await this.embeddingService.findSimilar(
      query,
      this.documents.map(doc => ({
        ...doc,
        embedding: doc.embedding || [] // Ensure embedding is always present
      })),
      {
        maxResults,
        minScore,
        signal,
      }
    );

    // Generate context from relevant documents, ensuring embedding is always present
    const context = this.generateContext(relevantDocs.map(r => {
      const doc: EmbeddingDocument = {
        ...r.document,
        embedding: r.document.embedding || [] // Ensure embedding is always present
      };
      return doc;
    }));

    // Create messages array with context and query
    const messages: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        role: 'system',
        content: `You are a helpful AI assistant. Use the following context to answer the user's question. If you cannot find the answer in the context, say so.

Context:
${context}`,
        timestamp: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: query,
        timestamp: Date.now(),
      },
    ];

    // Get response from chat model
    const response = await this.chatService.chat(messages, model, {
      max_tokens,
      temperature,
      signal,
    });

    if (typeof response === 'object' && response !== null && Symbol.asyncIterator in response) {
      throw new Error('Streaming not supported in RAG mode');
    }

    // Add source information to response
    const sources = relevantDocs.map(({ document, score }) => ({
      title: document.metadata.title || 'Untitled',
      source: document.metadata.source || 'Unknown',
      score: Math.round(score * 100) / 100,
    }));

    return {
      ...response,
      id: crypto.randomBytes(16).toString('hex'), // Generate a unique ID
      role: 'assistant', // Assuming this is an assistant response
      content: (response as ChatMessage).content, // Ensure content is preserved
      timestamp: Date.now(), // Add current timestamp
      metadata: {
        ...(response as ChatMessage).metadata || {},
        sources,
      },
    };
  }

  async *streamQuery(
    query: string,
    model: any,
    options: RAGOptions = {}
  ): AsyncGenerator<ChatMessage, void, unknown> {
    const {
      maxResults = 5,
      minScore = 0.7,
      max_tokens = 1000,
      temperature = 0.7,
      signal,
    } = options;

    // Find relevant documents
    const relevantDocs = await this.embeddingService.findSimilar(
      query,
      this.documents.map(doc => ({
        ...doc,
        embedding: doc.embedding || [] // Ensure embedding is always present
      })),
      {
        maxResults,
        minScore,
        signal,
      }
    );

    // Generate context from relevant documents, ensuring embedding is always present
    const context = this.generateContext(relevantDocs.map(r => {
      const doc: EmbeddingDocument = {
        ...r.document,
        embedding: r.document.embedding || [] // Ensure embedding is always present
      };
      return doc;
    }));

    // Create messages array with context and query
    const messages: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        role: 'system',
        content: `You are a helpful AI assistant. Use the following context to answer the user's question. If you cannot find the answer in the context, say so.

Context:
${context}`,
        timestamp: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: query,
        timestamp: Date.now(),
      },
    ];

    // Get streaming response from chat model
    const stream = await this.chatService.chat(messages, model, {
      stream: true,
      max_tokens,
      temperature,
      signal,
    });

    if (!(typeof stream === 'object' && stream !== null && Symbol.asyncIterator in stream)) {
      throw new Error('Expected streaming response');
    }

    // Add source information to each chunk
    const sources = relevantDocs.map(({ document, score }) => ({
      title: document.metadata.title || 'Untitled',
      source: document.metadata.source || 'Unknown',
      score: Math.round(score * 100) / 100,
    }));

    let messageId = crypto.randomUUID();
    let content = '';

    for await (const chunk of stream) {
      content += chunk.content;
      yield {
        id: messageId,
        role: 'assistant',
        content,
        timestamp: Date.now(),
        streaming: true,
        metadata: {
          sources,
        },
      } as MessageWithMetadata;
    }

    // Final message with complete content
    yield {
      id: messageId,
      role: 'assistant',
      content,
      timestamp: Date.now(),
      streaming: false,
      metadata: {
        sources,
      },
    } as MessageWithMetadata;
  }

  private generateContext(documents: EmbeddingDocument[]): string {
    return documents
      .map(
        doc => `[${doc.metadata.title || 'Untitled'}]
${doc.content}
---`
      )
      .join('\n\n');
  }

  clearDocuments(): void {
    this.documents = [];
  }

  getDocuments(): Document[] {
    return [...this.documents];
  }
}
