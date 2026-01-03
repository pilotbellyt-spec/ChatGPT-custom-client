import { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import { marked } from 'marked';
import type { ChatMessage } from '../types';

interface Props {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 6
  });

  // Auto-scroll only while streaming or at bottom
  const atBottom = useMemo(() => {
    if (!parentRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    return scrollTop + clientHeight >= scrollHeight - 32;
  }, [messages.length]);

  useEffect(() => {
    if (isStreaming && atBottom) {
      parentRef.current?.scrollTo({ top: parentRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isStreaming, atBottom]);

  return (
    <div
      ref={parentRef}
      className="scroll-surface"
      style={{
        height: 'calc(100vh - 220px)',
        overflow: 'auto',
        padding: '1rem'
      }}
    >
      <div
        style={{
          position: 'relative',
          height: `${rowVirtualizer.getTotalSize()}px`
        }}
      >
        {rowVirtualizer.getVirtualItems().map((item) => {
          const message = messages[item.index];
          return (
            <article
              key={message.id}
              className={clsx('panel', 'message', `role-${message.role}`)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${item.start}px)`,
                padding: '1rem',
                marginBottom: '0.75rem'
              }}
            >
              <header
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem'
                }}
              >
                <span style={{ textTransform: 'capitalize', color: '#aeb7cc', fontWeight: 700 }}>
                  {message.role}
                </span>
                <small style={{ color: '#7a859c' }}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </small>
              </header>
              <div
                style={{
                  color: '#f4f6fb',
                  fontSize: '1rem',
                  lineHeight: 1.6
                }}
                dangerouslySetInnerHTML={{ __html: marked.parse(message.content) as string }}
              />
              {message.status === 'error' && (
                <div className="badge" style={{ background: '#b91c1c', marginTop: '0.5rem' }}>
                  Failed to deliver
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
