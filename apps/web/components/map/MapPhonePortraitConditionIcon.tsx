"use client";

import type { FogIntensity } from "@/lib/map/conditions";
import { getPhonePortraitConditionIconDataUri } from "@/lib/map/phonePortraitConditionIcons";
import { useIsNighttime } from "@/lib/hooks/useIsNighttime";

type MapPhonePortraitConditionIconProps = {
  intensity: FogIntensity;
  className?: string;
};

export function MapPhonePortraitConditionIcon({
  intensity,
  className = "h-7 w-7",
}: MapPhonePortraitConditionIconProps) {
  const isNighttime = useIsNighttime();

  return (
    <img
      src={getPhonePortraitConditionIconDataUri(intensity, { isNighttime })}
      alt=""
      width={28}
      height={28}
      aria-hidden
      className={className}
    />
  );
}
