import { heroCdnUrlForKey } from '@/lib/home/heroAssets';
import { contentPositionFromFocalPoint } from '@/lib/location/locationCircularImage';

/**
 * Phase 26 — page-level decorative Settings atmosphere.
 *
 * Uses the existing production Where's Karl hero `hero/marin-headlands/day.png`
 * (same canonical imageKey Home already uses for mixed-bay daytime, and the
 * same asset Favorites uses for page-level Bay atmosphere). Settings owns its
 * own constants so Favorites / Home background implementations stay frozen.
 *
 * PAGE-LEVEL Bay Area / Golden Gate / fog atmosphere only — never presented
 * as a specific Home Location photograph.
 */
export const SETTINGS_ATMOSPHERE_IMAGE_KEY = 'hero/marin-headlands/day.png';

export const SETTINGS_ATMOSPHERE_IMAGE_SIZE = {
  width: 1672,
  height: 941,
} as const;

export const SETTINGS_ATMOSPHERE_SUBJECT = {
  xMin: 0.4,
  xMax: 0.62,
  yMin: 0.28,
  yMax: 0.5,
} as const;

export const SETTINGS_ATMOSPHERE_FOCAL_POINT = {
  x: 0.5,
  y: 0.4,
} as const;

export function resolveSettingsAtmosphereImageUrl(): string | null {
  return heroCdnUrlForKey(SETTINGS_ATMOSPHERE_IMAGE_KEY);
}

export function resolveSettingsAtmosphereContentPosition(): {
  top: string;
  left: string;
} {
  return contentPositionFromFocalPoint(SETTINGS_ATMOSPHERE_FOCAL_POINT);
}

export type SettingsCoverCrop = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

export function resolveSettingsCoverCrop(input: {
  imageWidth: number;
  imageHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  focalX: number;
  focalY: number;
}): SettingsCoverCrop {
  const {
    imageWidth,
    imageHeight,
    viewportWidth,
    viewportHeight,
    focalX,
    focalY,
  } = input;
  const scale = Math.max(
    viewportWidth / imageWidth,
    viewportHeight / imageHeight,
  );
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;
  const overflowX = Math.max(0, scaledWidth - viewportWidth);
  const overflowY = Math.max(0, scaledHeight - viewportHeight);
  const offsetX = focalX * overflowX;
  const offsetY = focalY * overflowY;

  return {
    x0: offsetX / scaledWidth,
    y0: offsetY / scaledHeight,
    x1: (offsetX + viewportWidth) / scaledWidth,
    y1: (offsetY + viewportHeight) / scaledHeight,
  };
}

export function resolveSettingsAtmosphereCoverCrop(
  viewportWidth: number,
  viewportHeight: number,
): SettingsCoverCrop {
  return resolveSettingsCoverCrop({
    imageWidth: SETTINGS_ATMOSPHERE_IMAGE_SIZE.width,
    imageHeight: SETTINGS_ATMOSPHERE_IMAGE_SIZE.height,
    viewportWidth,
    viewportHeight,
    focalX: SETTINGS_ATMOSPHERE_FOCAL_POINT.x,
    focalY: SETTINGS_ATMOSPHERE_FOCAL_POINT.y,
  });
}
