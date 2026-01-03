# BetterGPT

BetterGPT is a high-performance custom ChatGPT client built with Vite, React, and TypeScript. It preserves all subscription, payment, and pricing safeguards while improving responsiveness for long, streaming conversations through virtualization and incremental rendering.

## Key features
- Virtualized message list to eliminate lag on long threads.
- Incremental streaming renderer to keep the UI responsive while tokens arrive.
- Strict subscription/paywall handling—no bypassing payments or plan requirements.
- Workspace-aware layout with conversation list, profile header, and chat composer.

## Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

### Environment
Set `VITE_API_BASE_URL` to point at the ChatGPT-compatible backend that handles auth, subscriptions, and billing. All requests include credentials and will honor server-side access controls.

> **Note:** Do not remove or alter payment gates. Billing and subscription checks are intentionally enforced in the UI and must remain intact.
