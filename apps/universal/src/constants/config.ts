/** Expo / Universal env adapters — platform-specific; do not move into @whereskarl/config. */

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
