import type { PlanInfo } from '../types';

export function PlanBadge({ plan }: { plan: PlanInfo }) {
  const color =
    plan.tier === 'enterprise' ? '#22c55e' : plan.tier === 'team' ? '#06b6d4' : plan.tier === 'plus' ? '#f59e0b' : '#64748b';

  return (
    <div className="badge" style={{ background: color }}>
      {plan.tier.toUpperCase()}
      {plan.requiresPayment && ' · Payment required'}
    </div>
  );
}
