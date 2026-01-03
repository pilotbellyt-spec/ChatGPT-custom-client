import { PlanBadge } from './PlanBadge';
import type { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onUpgrade: () => void;
}

export function UserHeader({ user, onUpgrade }: Props) {
  return (
    <div className="panel" style={{ margin: '1rem', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <img
        src={user.avatarUrl ?? `https://api.dicebear.com/8.x/shapes/svg?seed=${user.id}`}
        alt={user.name}
        width={44}
        height={44}
        style={{ borderRadius: '50%' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ color: '#e2e8f0', fontWeight: 700 }}>{user.name}</div>
        <small style={{ color: '#94a3b8' }}>{user.email}</small>
      </div>
      <PlanBadge plan={user.plan} />
      {user.plan.requiresPayment && (
        <button className="button" onClick={onUpgrade} type="button">
          Complete payment
        </button>
      )}
    </div>
  );
}
