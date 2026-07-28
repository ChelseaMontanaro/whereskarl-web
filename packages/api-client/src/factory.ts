import type { GetBestSunshineOptions, GetKarlIntelligenceOptions } from "@whereskarl/schemas";

import {
  apiFetch,
  buildApiUrl,
  resolveBaseUrl,
  type ApiClient,
  type ApiClientConfig,
  type ApiSearchParams,
} from "./client";
import * as health from "./health";
import * as intelligence from "./intelligence";
import * as weather from "./weather";

/**
 * Bind endpoint helpers to an injected base URL (or getter) and optional fetch.
 * Uses namespace imports so Vitest spies on endpoint exports still apply.
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return {
    apiFetch: <T>(
      path: string,
      options?: RequestInit,
      searchParams?: ApiSearchParams,
    ) => apiFetch<T>(config, path, options, searchParams),
    buildApiUrl: (path: string, searchParams?: ApiSearchParams) =>
      buildApiUrl(resolveBaseUrl(config), path, searchParams),
    getCurrent: () => weather.getCurrent(config),
    getLocations: () => weather.getLocations(config),
    getBestSunshine: (options?: GetBestSunshineOptions) =>
      weather.getBestSunshine(config, options),
    getHealth: () => health.getHealth(config),
    getKarlIntelligence: (options?: GetKarlIntelligenceOptions) =>
      intelligence.getKarlIntelligence(config, options),
  };
}
