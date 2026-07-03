// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";

import { buildApiUrl } from "@/lib/api/client";
import {
  getApiBaseUrl,
  isApiBaseUrlConfigured,
  PRODUCTION_API_BASE_URL,
  PUBLIC_ENV_VARS,
  resolveApiBaseUrl,
  setRuntimeApiBaseUrl,
} from "@/lib/env/publicEnv";
import { rootMetadata } from "@/lib/site/metadata";
import { SITE_URL } from "@/lib/site/config";
import sitemap from "@/app/sitemap";

describe("public environment config", () => {
  it("reports missing API configuration safely", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    setRuntimeApiBaseUrl(null);
    document.body.removeAttribute("data-api-base-url");

    expect(isApiBaseUrlConfigured()).toBe(false);
    expect(resolveApiBaseUrl()).toBeNull();
    expect(() => getApiBaseUrl()).toThrow(/NEXT_PUBLIC_API_URL is not configured/);
  });

  it("reads the production API base URL from static env access", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.whereskarl.live");
    setRuntimeApiBaseUrl(null);

    expect(getApiBaseUrl()).toBe("https://api.whereskarl.live");
    expect(buildApiUrl("/current")).toBe("https://api.whereskarl.live/current");
  });

  it("reads the API base URL from the server-injected DOM attribute", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    setRuntimeApiBaseUrl(null);
    document.body.dataset.apiBaseUrl = "https://api.whereskarl.live";

    expect(getApiBaseUrl()).toBe("https://api.whereskarl.live");
  });

  it("does not hardcode localhost as the production default", () => {
    expect(PRODUCTION_API_BASE_URL).toBe("https://api.whereskarl.live");
    expect(PRODUCTION_API_BASE_URL).not.toContain("localhost");
    expect(SITE_URL).toBe("https://whereskarl.live");
    expect(SITE_URL).not.toContain("localhost");
  });

  it("strips trailing slashes from the configured API base URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.whereskarl.live/");
    setRuntimeApiBaseUrl(null);

    expect(getApiBaseUrl()).toBe("https://api.whereskarl.live");
  });

  it("keeps production SEO config on the whereskarl.live domain for SSR builds", () => {
    expect(rootMetadata.metadataBase?.toString()).toBe(`${SITE_URL}/`);
    expect(sitemap()[0]?.url).toBe(SITE_URL);
  });

  it("documents the public API env var name", () => {
    expect(PUBLIC_ENV_VARS.apiUrl).toBe("NEXT_PUBLIC_API_URL");
  });
});
