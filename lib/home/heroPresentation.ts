import {
  normalizedHeroTimeOfDay,
  resolveHeroImageUrls,
} from "@/lib/home/heroAssets";
import type { KarlHeroImageryMetadata } from "@/lib/schemas/intelligence";

export type HeroPresentation = {
  stabilityKey: string;
  imageUrl: string | null;
  fallbackImageUrl: string | null;
  altText: string | null;
  isNightPresentation: boolean;
  atmosphereTopOpacity: number;
  atmosphereBottomOpacity: number;
  bottomGradientLeadOpacity: number;
  bottomGradientMidOpacity: number;
};

const DEFAULT_FALLBACK: HeroPresentation = {
  stabilityKey: "unavailable|day|default|hero_fog",
  imageUrl: null,
  fallbackImageUrl: null,
  altText: null,
  isNightPresentation: false,
  atmosphereTopOpacity: 0.26,
  atmosphereBottomOpacity: 0.52,
  bottomGradientLeadOpacity: 0.82,
  bottomGradientMidOpacity: 0.58,
};

function trimmedNonEmpty(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function defaultOverlayProfile(
  conditionState: string,
  isNightPresentation: boolean,
): Pick<
  HeroPresentation,
  | "atmosphereTopOpacity"
  | "atmosphereBottomOpacity"
  | "bottomGradientLeadOpacity"
  | "bottomGradientMidOpacity"
> {
  const state = conditionState.toLowerCase();

  if (isNightPresentation) {
    switch (state) {
      case "coastal-fog":
        return {
          atmosphereTopOpacity: 0.38,
          atmosphereBottomOpacity: 0.68,
          bottomGradientLeadOpacity: 0.78,
          bottomGradientMidOpacity: 0.54,
        };
      case "clear":
        return {
          atmosphereTopOpacity: 0.26,
          atmosphereBottomOpacity: 0.56,
          bottomGradientLeadOpacity: 0.68,
          bottomGradientMidOpacity: 0.42,
        };
      default:
        return {
          atmosphereTopOpacity: 0.32,
          atmosphereBottomOpacity: 0.62,
          bottomGradientLeadOpacity: 0.72,
          bottomGradientMidOpacity: 0.48,
        };
    }
  }

  switch (state) {
    case "coastal-fog":
      return {
        atmosphereTopOpacity: 0.34,
        atmosphereBottomOpacity: 0.62,
        bottomGradientLeadOpacity: 0.86,
        bottomGradientMidOpacity: 0.64,
      };
    case "clear":
      return {
        atmosphereTopOpacity: 0.18,
        atmosphereBottomOpacity: 0.42,
        bottomGradientLeadOpacity: 0.74,
        bottomGradientMidOpacity: 0.5,
      };
    case "mixed-bay":
      return {
        atmosphereTopOpacity: 0.26,
        atmosphereBottomOpacity: 0.52,
        bottomGradientLeadOpacity: 0.82,
        bottomGradientMidOpacity: 0.58,
      };
    default:
      return {
        atmosphereTopOpacity: 0.26,
        atmosphereBottomOpacity: 0.52,
        bottomGradientLeadOpacity: 0.82,
        bottomGradientMidOpacity: 0.58,
      };
  }
}

export function resolveHeroPresentation(
  heroImagery?: KarlHeroImageryMetadata | null,
): HeroPresentation {
  if (!heroImagery) {
    return DEFAULT_FALLBACK;
  }

  const timeOfDay = normalizedHeroTimeOfDay(
    heroImagery.timeOfDay ?? heroImagery.presentation?.timeOfDay,
  );
  const presentation = heroImagery.presentation;
  const overlayFromPresentation =
    presentation?.atmosphereTopOpacity != null &&
    presentation.atmosphereBottomOpacity != null &&
    presentation.bottomGradientLeadOpacity != null &&
    presentation.bottomGradientMidOpacity != null
      ? {
          atmosphereTopOpacity: presentation.atmosphereTopOpacity,
          atmosphereBottomOpacity: presentation.atmosphereBottomOpacity,
          bottomGradientLeadOpacity: presentation.bottomGradientLeadOpacity,
          bottomGradientMidOpacity: presentation.bottomGradientMidOpacity,
        }
      : defaultOverlayProfile(
          heroImagery.conditionState,
          timeOfDay === "night",
        );
  const { imageUrl, fallbackImageUrl } = resolveHeroImageUrls(heroImagery);

  return {
    stabilityKey: heroImagery.stabilityKey,
    imageUrl,
    fallbackImageUrl,
    altText: trimmedNonEmpty(heroImagery.altText),
    isNightPresentation: timeOfDay === "night",
    ...overlayFromPresentation,
  };
}

export type HeroImageSource = "remote" | "local-fallback" | "gradient";

export function selectHeroImageSource(input: {
  imageUrl: string | null;
  fallbackImageUrl?: string | null;
  remoteLoadFailed?: boolean;
  fallbackLoadFailed?: boolean;
}): HeroImageSource {
  if (input.imageUrl && !input.remoteLoadFailed) {
    return "remote";
  }

  if (input.fallbackImageUrl && !input.fallbackLoadFailed) {
    return "local-fallback";
  }

  return "gradient";
}

export function activeHeroImageUrl(
  presentation: HeroPresentation,
  source: HeroImageSource,
): string | null {
  if (source === "remote") {
    return presentation.imageUrl;
  }

  if (source === "local-fallback") {
    return presentation.fallbackImageUrl;
  }

  return null;
}
