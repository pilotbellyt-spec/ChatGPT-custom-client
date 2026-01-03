import { z } from 'zod';
import type { ChatMessage, Conversation, PlanInfo, StreamChunk, UserProfile } from '../types';

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api';

const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().optional(),
  plan: z.object({
    tier: z.enum(['free', 'plus', 'team', 'enterprise']),
    expiresAt: z.string().optional(),
    seatCount: z.number().optional(),
    features: z.array(z.string()),
    requiresPayment: z.boolean()
  })
});

function buildUrl(path: string) {
  return `${apiBase}${path}`;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    },
    credentials: 'include'
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchProfile(): Promise<UserProfile> {
  const data = await fetchJson<unknown>('/me');
  return profileSchema.parse(data);
}

export async function fetchConversations(): Promise<Conversation[]> {
  return fetchJson('/conversations');
}

export async function fetchConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  return fetchJson(`/conversations/${conversationId}/messages`);
}

export interface SendMessageRequest {
  conversationId: string;
  message: string;
  model: string;
  systemPrompt?: string;
  attachments?: File[];
}

export async function* streamChatCompletion(
  payload: SendMessageRequest
): AsyncGenerator<StreamChunk, void, unknown> {
  const res = await fetch(buildUrl('/chat'), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (!res.ok || !res.body) {
    const text = await res.text();
    throw new Error(`Stream failed (${res.status}): ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    yield { content: chunk };
  }

  yield { content: '', done: true };
}

export async function updateSubscriptionIntent(plan: string): Promise<PlanInfo> {
  return fetchJson(`/billing/intent`, { method: 'POST', body: JSON.stringify({ plan }) });
}

export function ensureEntitled(plan: PlanInfo, requiredTier: PlanInfo['tier']) {
  if (plan.requiresPayment || plan.tier === 'free') {
    throw new Error(
      `Access requires an active ${requiredTier} subscription. Please complete payment to proceed.`
    );
  }
}
