import { FormEvent, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { streamChatCompletion } from '../api/client';
import { useEventStream } from '../hooks/useEventStream';
import type { ChatMessage } from '../types';

interface Props {
  conversationId: string;
  model: string;
  onChunk: (content: string) => void;
  onCommit: (message: ChatMessage) => void;
  onComplete: () => void;
}

export function Composer({ conversationId, model, onChunk, onCommit, onComplete }: Props) {
  const [draft, setDraft] = useState('');
  const [optimisticId, setOptimisticId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const stream = useEventStream(
    () =>
      streamChatCompletion({
        conversationId,
        message: draft,
        model
      }),
    {
      onChunk: (chunk) => {
        if (chunk.done) return;
        onChunk(chunk.content);
      },
      onDone: () => {
        setOptimisticId(null);
        onComplete();
      },
      onError: () => {
        setOptimisticId(null);
      }
    }
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(220, textareaRef.current.scrollHeight)}px`;
    }
  }, [draft]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || stream.isStreaming) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: draft.trim(),
      createdAt: new Date().toISOString(),
      status: 'sending'
    };
    setOptimisticId(newMessage.id);
    onCommit(newMessage);
    setDraft('');
    stream.start();
  };

  return (
    <form onSubmit={handleSubmit} className="panel" style={{ padding: '1rem', marginTop: '0.5rem' }}>
      <label htmlFor="composer" style={{ color: '#9aa4b5', fontWeight: 700 }}>
        Ask BetterGPT
      </label>
      <textarea
        id="composer"
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Send a message..."
        className={clsx('scroll-surface')}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          color: '#f8fafc',
          padding: '0.75rem',
          resize: 'none',
          marginTop: '0.5rem',
          minHeight: '80px'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <small style={{ color: '#7a859c' }}>
          Streaming optimized: virtualized render & chunked markdown updates.
        </small>
        <button className="button" type="submit" disabled={!draft.trim() || stream.isStreaming}>
          {stream.isStreaming ? 'Streaming…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
