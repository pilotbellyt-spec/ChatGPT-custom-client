import type { PlanInfo } from '../types';

interface Props {
  plan: PlanInfo;
  onUpgrade: () => void;
}

export function PaywallNotice({ plan, onUpgrade }: Props) {
  if (!plan.requiresPayment && plan.tier !== 'free') {
    return null;
  }

  return (
    <div className="panel" style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 style={{ margin: '0 0 0.25rem', color: '#f8fafc' }}>Payment required</h3>
      <p style={{ color: '#cbd5e1' }}>
        Your subscription requires payment before you can continue using BetterGPT. Access to paid features remains
        gated until payment is complete.
      </p>
      <button className="button" onClick={onUpgrade} type="button">
        Proceed to billing
      </button>
    </div>
  );
}
