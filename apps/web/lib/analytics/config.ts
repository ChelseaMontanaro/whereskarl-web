/**
 * Analytics is intentionally disabled until a provider and production ID are chosen.
 * Wire the provider inside `lib/analytics/index.ts` when ready.
 */
export const ANALYTICS_ENABLED = false;

export const ANALYTICS_PROVIDER = null as "plausible" | "vercel" | "ga4" | null;

export const ANALYTICS_SITE_ID: string | null = null;
