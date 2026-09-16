import { heroCdnUrlForKey } from '@/lib/home/heroAssets';
import { contentPositionFromFocalPoint } from '@/lib/location/locationCircularImage';

/**
 * Phase 25 — page-level decorative Favorites atmosphere.
 *
 * This is the approved production Where's Karl hero asset, referenced by the
 * same canonical imageKey Home already uses for the marin-headlands / mixed-bay
 * fallback. It is PAGE-LEVEL Bay Area atmosphere only and must never be
 * presented as depicting a specific saved favorite.
 */
export const FAVORITES_ATMOSPHERE_IMAGE_KEY = 'hero/marin-headlands/day.png';

export const FAVORITES_ATMOSPHERE_IMAGE_SIZE = {
  width: 1672,
  height: 941,
} as const;

/**
 * Approximate Golden Gate Bridge span + marine-layer bank inside the source
 * photograph (fractions of image width/height). Used to verify portrait
 * `cover` crops keep the subject on-screen.
 */
export const FAVORITES_ATMOSPHERE_SUBJECT = {
  xMin: 0.4,
  xMax: 0.62,
  yMin: 0.28,
  yMax: 0.5,
} as const;

/**
 * CSS object-position focal point. Horizontal 0.5 keeps both towers inside
 * the ~26% slice visible on 390/430 portrait; vertical 0.4 is inert whenever
 * the viewport is narrower than the photo (all current verification sizes)
 * and only matters if a very wide viewport starts cropping top/bottom.
 */
export const FAVORITES_ATMOSPHERE_FOCAL_POINT = {
  x: 0.5,
  y: 0.4,
} as const;

export function resolveFavoritesAtmosphereImageUrl(): string | null {
  return heroCdnUrlForKey(FAVORITES_ATMOSPHERE_IMAGE_KEY);
}

export function resolveFavoritesAtmosphereContentPosition(): {
  top: string;
  left: string;
} {
  return contentPositionFromFocalPoint(FAVORITES_ATMOSPHERE_FOCAL_POINT);
}

export type CoverCrop = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

/**
 * Visible source-image window (0–1) for `contentFit="cover"` with CSS-style
 * object-position. Layout-dimension only — no device-model branching.
 */
export function resolveCoverCrop(input: {
  imageWidth: number;
  imageHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  focalX: number;
  focalY: number;
}): CoverCrop {
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

export function resolveFavoritesAtmosphereCoverCrop(
  viewportWidth: number,
  viewportHeight: number,
): CoverCrop {
  return resolveCoverCrop({
    imageWidth: FAVORITES_ATMOSPHERE_IMAGE_SIZE.width,
    imageHeight: FAVORITES_ATMOSPHERE_IMAGE_SIZE.height,
    viewportWidth,
    viewportHeight,
    focalX: FAVORITES_ATMOSPHERE_FOCAL_POINT.x,
    focalY: FAVORITES_ATMOSPHERE_FOCAL_POINT.y,
  });
}
