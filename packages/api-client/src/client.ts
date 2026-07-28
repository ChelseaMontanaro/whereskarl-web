/**
 * Shared HTTP transport for Where's Karl backend APIs.
 *
 * Apps inject the resolved base URL (or a getter). This package never reads env.
 */

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ApiSearchParams = Record<
  string,
  string | number | boolean | undefined | null
>;

export type ApiClientConfig = {
  /** Resolved API origin without a trailing slash (apps strip trailing slashes). */
  baseUrl?: string;
  /** Lazily resolve the API origin; preferred when env can change between calls. */
  getBaseUrl?: () => string;
  /** Optional fetch implementation (tests / non-global environments). */
  fetchImpl?: typeof fetch;
};

export type ApiClient = {
  apiFetch: <T>(
    path: string,
    options?: RequestInit,
    searchParams?: ApiSearchParams,
  ) => Promise<T>;
  buildApiUrl: (path: string, searchParams?: ApiSearchParams) => string;
  getCurrent: () => ReturnType<typeof import("./weather").getCurrent>;
  getLocations: () => ReturnType<typeof import("./weather").getLocations>;
  getBestSunshine: (
    options?: import("@whereskarl/schemas").GetBestSunshineOptions,
  ) => ReturnType<typeof import("./weather").getBestSunshine>;
  getHealth: () => ReturnType<typeof import("./health").getHealth>;
  getKarlIntelligence: (
    options?: import("@whereskarl/schemas").GetKarlIntelligenceOptions,
  ) => ReturnType<typeof import("./intelligence").getKarlIntelligence>;
}

export function resolveBaseUrl(config: ApiClientConfig): string {
  if (typeof config.baseUrl === "string") {
    return config.baseUrl;
  }

  if (config.getBaseUrl) {
    return config.getBaseUrl();
  }

  throw new Error("ApiClientConfig requires baseUrl or getBaseUrl");
}

export function buildApiPath(
  path: string,
  searchParams?: ApiSearchParams,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!searchParams) {
    return normalizedPath;
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

export function buildApiUrl(
  baseUrl: string,
  path: string,
  searchParams?: ApiSearchParams,
): string {
  return `${baseUrl}${buildApiPath(path, searchParams)}`;
}

export async function apiFetch<T>(
  config: ApiClientConfig,
  path: string,
  options?: RequestInit,
  searchParams?: ApiSearchParams,
): Promise<T> {
  const requestPath = buildApiPath(path, searchParams);
  const requestUrl = `${resolveBaseUrl(config)}${requestPath}`;
  const fetchImpl = config.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl(requestUrl, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      console.error(
        `[Where's Karl API] ${requestUrl} failed with status ${response.status}`,
      );
      throw new ApiError(
        `API request failed with status ${response.status}`,
        response.status,
      );
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error(`[Where's Karl API] ${requestUrl} request failed`, error);
    }

    throw error;
  }
}
