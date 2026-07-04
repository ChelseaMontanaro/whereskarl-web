import type { KarlHeroImageryMetadata } from "@/lib/schemas/intelligence";

/** Shared CDN host for hero imagery referenced by backend imageKey paths. */
export const HERO_CDN_BASE =
  "https://snhitxyrhse7o7xm.public.blob.vercel-storage.com";

/** Maps backend localFallbackAsset keys to known-good CDN scene slugs. */
export const HERO_LOCAL_FALLBACK_SCENES: Record<string, string> = {
  hero_clearing: "oakland",
  hero_mixed: "marin-headlands",
  hero_fog: "ocean-beach",
};

export type HeroImageUrls = {
  imageUrl: string | null;
  fallbackImageUrl: string | null;
};

function trimmedNonEmpty(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizedHeroTimeOfDay(
  value: string | null | undefined,
): "day" | "night" {
  return trimmedNonEmpty(value)?.toLowerCase() === "night" ? "night" : "day";
}

export function remoteHeroImageURL(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function heroCdnUrlForKey(imageKey: string | null | undefined): string | null {
  const normalized = trimmedNonEmpty(imageKey)?.replace(/^\/+/, "");

  if (!normalized) {
    return null;
  }

  return `${HERO_CDN_BASE}/${normalized}`;
}

export function resolveLocalFallbackImageKey(
  localFallbackAsset: string | null | undefined,
  timeOfDay: "day" | "night",
): string | null {
  const scene = HERO_LOCAL_FALLBACK_SCENES[trimmedNonEmpty(localFallbackAsset) ?? ""];

  if (!scene) {
    return null;
  }

  return `hero/${scene}/${timeOfDay}.png`;
}

export function resolveLocalFallbackImageUrl(
  localFallbackAsset: string | null | undefined,
  timeOfDay: "day" | "night",
): string | null {
  return heroCdnUrlForKey(resolveLocalFallbackImageKey(localFallbackAsset, timeOfDay));
}

export function resolveHeroImageUrls(
  heroImagery: KarlHeroImageryMetadata,
): HeroImageUrls {
  const timeOfDay = normalizedHeroTimeOfDay(
    heroImagery.timeOfDay ?? heroImagery.presentation?.timeOfDay,
  );
  const localFallbackAsset =
    heroImagery.localFallbackAsset ??
    heroImagery.presentation?.localFallbackAsset ??
    null;
  const fallbackImageUrl = resolveLocalFallbackImageUrl(
    localFallbackAsset,
    timeOfDay,
  );
  const remotePrimary = remoteHeroImageURL(heroImagery.imageUrl);
  const imageUrl = remotePrimary ?? fallbackImageUrl;

  return {
    imageUrl,
    fallbackImageUrl: remotePrimary ? fallbackImageUrl : null,
  };
}
