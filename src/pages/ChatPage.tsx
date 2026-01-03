import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchConversationMessages, fetchConversations, fetchProfile, updateSubscriptionIntent } from '../api/client';
import { ConversationList } from '../components/ConversationList';
import { MessageList } from '../components/MessageList';
import { Composer } from '../components/Composer';
import { PaywallNotice } from '../components/PaywallNotice';
import { UserHeader } from '../components/UserHeader';
import type { ChatMessage, Conversation } from '../types';

const defaultModel = 'gpt-4.1';

export function ChatPage() {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [inFlightMessage, setInFlightMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile
  });

  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    onSuccess: (items) => {
      if (!activeConversation && items.length) {
        setActiveConversation(items[0]);
      }
    }
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', activeConversation?.id],
    enabled: Boolean(activeConversation?.id),
    queryFn: () => fetchConversationMessages(activeConversation!.id),
    onSuccess: (data) => setMessages(data)
  });

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(messagesQuery.data);
    }
  }, [messagesQuery.data]);

  const combinedMessages = useMemo(() => {
    if (!inFlightMessage) return messages;
    return [
      ...messages,
      {
        id: 'streaming',
        role: 'assistant',
        content: inFlightMessage,
        createdAt: new Date().toISOString(),
        status: 'streaming'
      }
    ];
  }, [messages, inFlightMessage]);

  const handleChunk = (content: string) => {
    setInFlightMessage((prev) => prev + content);
  };

  const handleCommit = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
    setInFlightMessage('');
  };

  const handleStreamingComplete = () => {
    if (!inFlightMessage) return;
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: inFlightMessage,
        createdAt: new Date().toISOString(),
        status: 'done'
      }
    ]);
    setInFlightMessage('');
  };

  const onUpgrade = async () => {
    if (!profileQuery.data) return;
    await updateSubscriptionIntent(profileQuery.data.plan.tier);
    profileQuery.refetch();
  };

  if (profileQuery.isLoading || conversationsQuery.isLoading) {
    return <div style={{ color: '#e2e8f0', padding: '2rem' }}>Loading BetterGPT…</div>;
  }

  if (profileQuery.error || conversationsQuery.error) {
    return (
      <div style={{ color: '#fca5a5', padding: '2rem' }}>
        Failed to load workspace. Please sign in and ensure your subscription is active.
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside>
        {profileQuery.data && <UserHeader user={profileQuery.data} onUpgrade={onUpgrade} />}
        <ConversationList
          conversations={conversationsQuery.data ?? []}
          activeId={activeConversation?.id ?? null}
          onSelect={(id) => setActiveConversation(conversationsQuery.data?.find((c) => c.id === id) ?? null)}
        />
      </aside>
      <main style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {profileQuery.data && <PaywallNotice plan={profileQuery.data.plan} onUpgrade={onUpgrade} />}
        <div
          className="panel"
          style={{
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            minHeight: '70vh'
          }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem' }}>
            <div>
              <h1 style={{ margin: 0, color: '#f8fafc' }}>BetterGPT</h1>
              <small style={{ color: '#94a3b8' }}>High-performance chat with intact subscription gating.</small>
            </div>
            <div className="badge">Model: {activeConversation?.model ?? defaultModel}</div>
          </header>

          <MessageList messages={combinedMessages} isStreaming={Boolean(inFlightMessage)} />
          {activeConversation && (
            <Composer
              conversationId={activeConversation.id}
              model={activeConversation.model ?? defaultModel}
              onChunk={(c) => {
                handleChunk(c);
              }}
              onCommit={(message) => {
                handleCommit(message);
              }}
              onComplete={handleStreamingComplete}
            />
          )}
        </div>
        {inFlightMessage && (
          <div className="panel" style={{ padding: '0.75rem', color: '#cbd5e1' }}>
            Streaming in progress… responses are rendered incrementally to avoid lag on large chats.
          </div>
        )}
      </main>
    </div>
  );
}
