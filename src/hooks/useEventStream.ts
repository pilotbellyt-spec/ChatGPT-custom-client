import { useEffect, useRef, useState } from 'react';
import type { StreamChunk } from '../types';

interface Options {
  onChunk?: (chunk: StreamChunk) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export function useEventStream(streamFactory: () => AsyncGenerator<StreamChunk>, opts: Options = {}) {
  const [isStreaming, setStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cancelRef = useRef<() => void>();

  useEffect(() => {
    return () => {
      cancelRef.current?.();
    };
  }, []);

  const start = async () => {
    setStreaming(true);
    setError(null);
    const controller = new AbortController();
    cancelRef.current = () => controller.abort();

    try {
      const iterator = streamFactory();
      for await (const chunk of iterator) {
        if (controller.signal.aborted) break;
        opts.onChunk?.(chunk);
        if (chunk.done) {
          opts.onDone?.();
        }
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown stream error');
      setError(errorObj);
      opts.onError?.(errorObj);
    } finally {
      setStreaming(false);
      cancelRef.current = undefined;
    }
  };

  const cancel = () => {
    cancelRef.current?.();
    setStreaming(false);
  };

  return { start, cancel, isStreaming, error };
}
