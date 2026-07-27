/** Documented production backend URL — set via EXPO_PUBLIC_API_URL in deploy hosts. */
export const PRODUCTION_API_BASE_URL = 'https://api.whereskarl.live';

export const PUBLIC_ENV_VARS = {
  apiUrl: 'EXPO_PUBLIC_API_URL',
} as const;

export function readConfiguredApiBaseUrl(): string | undefined {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  return url ? url.replace(/\/$/, '') : undefined;
}

export function isApiBaseUrlConfigured(): boolean {
  return Boolean(readConfiguredApiBaseUrl());
}

export function getApiBaseUrl(): string {
  const url = readConfiguredApiBaseUrl();

  if (!url) {
    throw new Error(`${PUBLIC_ENV_VARS.apiUrl} is not configured`);
  }

  return url;
}

export function resolveApiBaseUrl(): string | null {
  return isApiBaseUrlConfigured() ? getApiBaseUrl() : null;
}
