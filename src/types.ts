export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  status?: 'sending' | 'streaming' | 'error' | 'done';
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  unread?: boolean;
}

export interface PlanInfo {
  tier: 'free' | 'plus' | 'team' | 'enterprise';
  expiresAt?: string;
  seatCount?: number;
  features: string[];
  requiresPayment: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: PlanInfo;
}

export interface StreamChunk {
  content: string;
  done?: boolean;
}
