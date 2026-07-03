import type { KarlHeroImageryMetadata } from "@/lib/schemas/intelligence";

export type HeroPresentation = {
  stabilityKey: string;
  imageUrl: string | null;
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

function normalizedTimeOfDay(value: string | null | undefined): "day" | "night" {
  return trimmedNonEmpty(value)?.toLowerCase() === "night" ? "night" : "day";
}

function remoteImageURL(value: string | null | undefined): string | null {
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

  const timeOfDay = normalizedTimeOfDay(
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

  return {
    stabilityKey: heroImagery.stabilityKey,
    imageUrl: remoteImageURL(heroImagery.imageUrl),
    altText: trimmedNonEmpty(heroImagery.altText),
    isNightPresentation: timeOfDay === "night",
    ...overlayFromPresentation,
  };
}

export function selectHeroImageSource(input: {
  imageUrl: string | null;
  remoteLoadFailed: boolean;
}): "remote" | "fallback" {
  if (input.imageUrl && !input.remoteLoadFailed) {
    return "remote";
  }

  return "fallback";
}
