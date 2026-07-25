/**
 * Public environment-variable contract for whereskarl.live.
 *
 * | Variable | Local | Preview | Production |
 * | --- | --- | --- | --- |
 * | `NEXT_PUBLIC_API_URL` | Local backend URL (e.g. `http://localhost:3000`) | Preview/staging backend URL | `https://api.whereskarl.live` |
 *
 * All values are public (browser-visible). Do not put secrets here.
 * Copy `.env.example` to `.env.local` for local development.
 *
 * Important: read `NEXT_PUBLIC_*` vars with static property access only.
 * Next.js will not inline values accessed via `process.env[variableName]`.
 */

export const PUBLIC_ENV_VARS = {
  apiUrl: "NEXT_PUBLIC_API_URL",
} as const;

/** Documented production backend URL — set via `NEXT_PUBLIC_API_URL` in deploy hosts. */
export const PRODUCTION_API_BASE_URL = "https://api.whereskarl.live";

const API_URL_DATA_ATTRIBUTE = "apiBaseUrl";

let runtimeApiBaseUrl: string | null = null;

export function setRuntimeApiBaseUrl(url: string | null | undefined): void {
  const trimmed = url?.trim();
  runtimeApiBaseUrl = trimmed ? trimmed.replace(/\/$/, "") : null;
}

function readRuntimeApiBaseUrlFromDom(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const url = document.body.dataset[API_URL_DATA_ATTRIBUTE]?.trim();
  return url ? url.replace(/\/$/, "") : undefined;
}

function readBuildTimeApiBaseUrl(): string | undefined {
  // Static access is required for Next.js client-bundle inlining.
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  return url ? url.replace(/\/$/, "") : undefined;
}

export function readConfiguredApiBaseUrl(): string | undefined {
  return runtimeApiBaseUrl ?? readRuntimeApiBaseUrlFromDom() ?? readBuildTimeApiBaseUrl();
}

export function isApiBaseUrlConfigured(): boolean {
  return Boolean(readConfiguredApiBaseUrl());
}

export function getApiBaseUrl(): string {
  const url = readConfiguredApiBaseUrl();

  if (!url) {
    console.error(
      "[Where's Karl API] NEXT_PUBLIC_API_URL is not configured for client requests.",
    );
    throw new Error(`${PUBLIC_ENV_VARS.apiUrl} is not configured`);
  }

  return url;
}

export function resolveApiBaseUrl(): string | null {
  if (!isApiBaseUrlConfigured()) {
    return null;
  }

  return getApiBaseUrl();
}
