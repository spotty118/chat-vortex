import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, StreamingOptions, StreamChunk } from '@/lib/types/ai';

interface StreamingState {
  isStreaming: boolean;
  streamedContent: string;
  chunks: StreamChunk[];
  error: Error | null;
  startTime: number | null;
  endTime: number | null;
}

export const useStreamingResponse = (options: StreamingOptions = {}) => {
  const {
    onChunk,
    onComplete,
    onError,
    processChunk = (chunk: StreamChunk) => chunk.content,
    bufferSize = 3,
    flushInterval = 50,
  } = options;

  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    streamedContent: '',
    chunks: [],
    error: null,
    startTime: null,
    endTime: null,
  });

  const buffer = useRef<StreamChunk[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  // Process buffered chunks
  const processBuffer = useCallback(() => {
    if (buffer.current.length === 0) return;

    const chunks = [...buffer.current];
    buffer.current = [];

    setState(prev => {
      const newContent = chunks.reduce((acc, chunk) => {
        try {
          return acc + processChunk(chunk);
        } catch (error) {
          console.error('Error processing chunk:', error);
          return acc;
        }
      }, prev.streamedContent);

      return {
        ...prev,
        streamedContent: newContent,
        chunks: [...prev.chunks, ...chunks],
      };
    });

    chunks.forEach(chunk => onChunk?.(chunk));
  }, [onChunk, processChunk]);

  // Schedule buffer flush
  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }

    flushTimeoutRef.current = setTimeout(processBuffer, flushInterval);
  }, [processBuffer, flushInterval]);

  // Add chunk to buffer
  const addChunk = useCallback((chunk: StreamChunk) => {
    buffer.current.push(chunk);

    if (buffer.current.length >= bufferSize) {
      processBuffer();
    } else {
      scheduleFlush();
    }
  }, [bufferSize, processBuffer, scheduleFlush]);

  // Start streaming
  const startStreaming = useCallback(async (
    streamGenerator: AsyncGenerator<StreamChunk, void, unknown>
  ) => {
    if (state.isStreaming) {
      throw new Error('Already streaming');
    }

    // Reset state
    setState({
      isStreaming: true,
      streamedContent: '',
      chunks: [],
      error: null,
      startTime: Date.now(),
      endTime: null,
    });

    buffer.current = [];
    abortControllerRef.current = new AbortController();

    try {
      for await (const chunk of streamGenerator) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        addChunk(chunk);
      }

      // Process any remaining chunks
      processBuffer();

      const endTime = Date.now();
      setState(prev => ({
        ...prev,
        isStreaming: false,
        endTime,
      }));

      onComplete?.({
        content: state.streamedContent,
        chunks: state.chunks,
        duration: endTime - (state.startTime || endTime),
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorObj,
        endTime: Date.now(),
      }));
      onError?.(errorObj);
    }
  }, [state.isStreaming, state.startTime, state.streamedContent, state.chunks, addChunk, processBuffer, onComplete, onError]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    processBuffer();
    setState(prev => ({
      ...prev,
      isStreaming: false,
      endTime: prev.endTime || Date.now(),
    }));
  }, [processBuffer]);

  // Create message from stream
  const createMessage = useCallback((
    role: ChatMessage['role'] = 'assistant'
  ): ChatMessage => {
    return {
      id: crypto.randomUUID(),
      role,
      content: state.streamedContent,
      timestamp: Date.now(),
      streaming: state.isStreaming,
      chunks: state.chunks,
      error: state.error,
      duration: state.endTime && state.startTime
        ? state.endTime - state.startTime
        : undefined,
    };
  }, [state]);

  return {
    isStreaming: state.isStreaming,
    streamedContent: state.streamedContent,
    chunks: state.chunks,
    error: state.error,
    duration: state.endTime && state.startTime
      ? state.endTime - state.startTime
      : undefined,
    startStreaming,
    stopStreaming,
    createMessage,
  };
};
