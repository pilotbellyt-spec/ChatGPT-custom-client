import { useMemo } from 'react';
import clsx from 'clsx';
import type { Conversation } from '../types';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, activeId, onSelect }: Props) {
  const sorted = useMemo(
    () =>
      [...conversations].sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.updatedAt < b.updatedAt ? 1 : -1)),
    [conversations]
  );

  return (
    <div className="panel scroll-surface" style={{ margin: '1rem', padding: '0.75rem', maxHeight: 'calc(100vh - 2rem)', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div className="badge">BetterGPT</div>
        <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Conversations</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {sorted.map((conversation) => (
          <li key={conversation.id}>
            <button
              className={clsx('panel', activeId === conversation.id && 'active')}
              onClick={() => onSelect(conversation.id)}
              style={{
                width: '100%',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '0.75rem',
                borderRadius: '12px',
                background: activeId === conversation.id ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.02)',
                color: '#e2e8f0',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, textAlign: 'left' }}>{conversation.title}</span>
                {conversation.pinned && (
                  <span className="badge" style={{ background: '#f59e0b' }}>
                    Pinned
                  </span>
                )}
              </div>
              <small style={{ color: '#94a3b8' }}>{conversation.model}</small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
