import {
  ANALYTICS_ENABLED,
  ANALYTICS_PROVIDER,
  ANALYTICS_SITE_ID,
} from "@/lib/analytics/config";

export type AnalyticsEventProperties = Record<string, string | number | boolean>;

export function isAnalyticsConfigured(): boolean {
  return ANALYTICS_ENABLED && ANALYTICS_PROVIDER !== null && ANALYTICS_SITE_ID !== null;
}

/** No-op until a real analytics provider is configured. */
export function trackPageView(path: string): void {
  if (!isAnalyticsConfigured()) {
    return;
  }

  void path;
}

/** No-op until a real analytics provider is configured. */
export function trackEvent(
  name: string,
  properties?: AnalyticsEventProperties,
): void {
  if (!isAnalyticsConfigured()) {
    return;
  }

  void name;
  void properties;
}
