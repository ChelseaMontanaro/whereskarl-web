import { describe, expect, it, vi } from "vitest";

import { buildApiUrl } from "@/lib/api/client";
import {
  getApiBaseUrl,
  isApiBaseUrlConfigured,
  PRODUCTION_API_BASE_URL,
  PUBLIC_ENV_VARS,
  resolveApiBaseUrl,
} from "@/lib/env/publicEnv";
import { rootMetadata } from "@/lib/site/metadata";
import { SITE_URL } from "@/lib/site/config";
import sitemap from "@/app/sitemap";

describe("public environment config", () => {
  it("reports missing API configuration safely", () => {
    vi.stubEnv(PUBLIC_ENV_VARS.apiUrl, "");

    expect(isApiBaseUrlConfigured()).toBe(false);
    expect(resolveApiBaseUrl()).toBeNull();
    expect(() => getApiBaseUrl()).toThrow(/NEXT_PUBLIC_API_URL is not configured/);
  });

  it("reads the production API base URL from the environment variable", () => {
    vi.stubEnv(PUBLIC_ENV_VARS.apiUrl, "https://api.whereskarl.live");

    expect(getApiBaseUrl()).toBe("https://api.whereskarl.live");
    expect(buildApiUrl("/current")).toBe("https://api.whereskarl.live/current");
  });

  it("does not hardcode localhost as the production default", () => {
    expect(PRODUCTION_API_BASE_URL).toBe("https://api.whereskarl.live");
    expect(PRODUCTION_API_BASE_URL).not.toContain("localhost");
    expect(SITE_URL).toBe("https://whereskarl.live");
    expect(SITE_URL).not.toContain("localhost");
  });

  it("strips trailing slashes from the configured API base URL", () => {
    vi.stubEnv(PUBLIC_ENV_VARS.apiUrl, "https://api.whereskarl.live/");

    expect(getApiBaseUrl()).toBe("https://api.whereskarl.live");
  });

  it("keeps production SEO config on the whereskarl.live domain for SSR builds", () => {
    expect(rootMetadata.metadataBase?.toString()).toBe(`${SITE_URL}/`);
    expect(sitemap()[0]?.url).toBe(SITE_URL);
  });
});
