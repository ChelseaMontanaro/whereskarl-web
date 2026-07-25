import { describe, expect, it } from "vitest";

import { isAnalyticsConfigured, trackEvent, trackPageView } from "@/lib/analytics";

describe("analytics", () => {
  it("stays disabled until a provider and site id are configured", () => {
    expect(isAnalyticsConfigured()).toBe(false);
  });

  it("does not throw when tracking helpers are called", () => {
    expect(() => trackPageView("/map")).not.toThrow();
    expect(() => trackEvent("find_clear_skies_clicked")).not.toThrow();
  });
});
