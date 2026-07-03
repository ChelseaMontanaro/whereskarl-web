/**
 * Public environment-variable contract for whereskarl.live.
 *
 * | Variable | Local | Preview | Production |
 * | --- | --- | --- | --- |
 * | `NEXT_PUBLIC_API_URL` | Local backend URL (e.g. `http://localhost:3000`) | Preview/staging backend URL | `https://api.whereskarl.live` |
 *
 * All values are public (browser-visible). Do not put secrets here.
 * Copy `.env.example` to `.env.local` for local development.
 */

export const PUBLIC_ENV_VARS = {
  apiUrl: "NEXT_PUBLIC_API_URL",
} as const;

/** Documented production backend URL — set via `NEXT_PUBLIC_API_URL` in deploy hosts. */
export const PRODUCTION_API_BASE_URL = "https://api.whereskarl.live";

export function readPublicEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function isApiBaseUrlConfigured(): boolean {
  return Boolean(readPublicEnv(PUBLIC_ENV_VARS.apiUrl));
}

export function getApiBaseUrl(): string {
  const url = readPublicEnv(PUBLIC_ENV_VARS.apiUrl);

  if (!url) {
    throw new Error(`${PUBLIC_ENV_VARS.apiUrl} is not configured`);
  }

  return url.replace(/\/$/, "");
}

export function resolveApiBaseUrl(): string | null {
  if (!isApiBaseUrlConfigured()) {
    return null;
  }

  return getApiBaseUrl();
}
