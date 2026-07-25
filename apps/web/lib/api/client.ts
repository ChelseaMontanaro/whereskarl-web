import { getApiBaseUrl } from "@/lib/constants/config";

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
  path: string,
  searchParams?: ApiSearchParams,
): string {
  return `${getApiBaseUrl()}${buildApiPath(path, searchParams)}`;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  searchParams?: ApiSearchParams,
): Promise<T> {
  const requestPath = buildApiPath(path, searchParams);
  const requestUrl = `${getApiBaseUrl()}${requestPath}`;

  try {
    const response = await fetch(requestUrl, {
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
