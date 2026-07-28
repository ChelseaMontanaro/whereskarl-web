/**
 * `@whereskarl/api-client` — HTTP transport and endpoint functions for the
 * Where's Karl backend. Platform-neutral; apps inject the resolved base URL.
 */

export {
  ApiError,
  apiFetch,
  buildApiPath,
  buildApiUrl,
  resolveBaseUrl,
  type ApiClient,
  type ApiClientConfig,
  type ApiSearchParams,
} from "./client";

export { createApiClient } from "./factory";

export { getHealth } from "./health";
export { getKarlIntelligence } from "./intelligence";
export { getBestSunshine, getCurrent, getLocations } from "./weather";
