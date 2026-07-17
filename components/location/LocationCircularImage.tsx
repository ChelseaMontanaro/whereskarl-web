"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { FocalPoint } from "@/lib/schemas/weather";

/** Exact circular frame used by Selected Location (and future Favorites / search). */
export const LOCATION_CIRCULAR_IMAGE_FRAME_CLASSNAME =
  "flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-white/[0.18] via-white/[0.06] to-transparent text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]";

export type LocationCircularImageProps = {
  /** Canonical backend hero CDN URL — never a frontend lookup table. */
  imageUrl?: string | null;
  /** Normalized 0–1 crop center from the backend scene catalog. */
  focalPoint?: FocalPoint | null;
  /** Accessible name for the location landmark image. */
  alt?: string;
  className?: string;
};

/**
 * Derive CSS object-position from backend focal-point fractions.
 * Falls back to center when focal metadata is absent.
 */
export function objectPositionFromFocalPoint(
  focalPoint?: FocalPoint | null,
): string {
  if (
    !focalPoint ||
    typeof focalPoint.x !== "number" ||
    typeof focalPoint.y !== "number" ||
    !Number.isFinite(focalPoint.x) ||
    !Number.isFinite(focalPoint.y)
  ) {
    return "50% 50%";
  }

  return `${formatFocalPercent(focalPoint.x)}% ${formatFocalPercent(focalPoint.y)}%`;
}

function formatFocalPercent(fraction: number): string {
  // Avoid binary float artifacts (e.g. 0.28 * 100 → 28.000000000000004).
  return String(Number((fraction * 100).toFixed(4)));
}

/**
 * Canonical circular renderer for location hero imagery.
 *
 * Presentation-only: consumes backend `imageUrl` + `focalPoint`, applies a CSS
 * circular crop with object-fit/object-position, and falls back to the existing
 * placeholder when imagery is missing or fails to load.
 */
export function LocationCircularImage({
  imageUrl,
  focalPoint,
  alt = "Location",
  className = LOCATION_CIRCULAR_IMAGE_FRAME_CLASSNAME,
}: LocationCircularImageProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const resolvedUrl =
    typeof imageUrl === "string" && imageUrl.trim().length > 0
      ? imageUrl.trim()
      : null;
  const showImage = Boolean(resolvedUrl) && !loadFailed;

  useEffect(() => {
    setLoadFailed(false);
  }, [resolvedUrl]);

  return (
    <span
      data-testid={
        showImage ? "location-circular-image" : "location-image-placeholder"
      }
      className={className}
    >
      {showImage ? (
        <Image
          src={resolvedUrl!}
          alt={alt}
          width={64}
          height={64}
          sizes="64px"
          priority
          fetchPriority="high"
          decoding="async"
          data-testid="location-circular-image-img"
          className="h-full w-full object-cover"
          style={{ objectPosition: objectPositionFromFocalPoint(focalPoint) }}
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <>
          <span className="px-1 text-[0.5625rem] font-semibold leading-[1.05] tracking-tight text-white/70">
            Location Image
          </span>
          <span className="text-[0.5rem] font-medium uppercase leading-[1.05] tracking-[0.08em] text-white/45">
            Coming Soon
          </span>
        </>
      )}
    </span>
  );
}
