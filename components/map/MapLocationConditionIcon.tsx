import Image from "next/image";

import {
  FogCoverageIcon,
  MoonIcon,
  SunshineIcon,
} from "@/components/home/ConditionIcons";
import {
  desktopGoldIconClass,
  desktopInsightIconFrameClass,
  desktopInsightIconSizeClass,
  desktopMistIconClass,
} from "@/components/home/desktopGlass";
import { isNighttime } from "@/lib/home/weatherDisplay";
import { getMarkerFogIntensity } from "@/lib/map/markers";
import type { LocationConditionInput } from "@/lib/map/conditions";

const KARL_LOGO_SRC = "/brand/wheres-karl-logo@2x.png";

type MapLocationConditionIconProps = {
  location: LocationConditionInput;
  className?: string;
};

export function MapLocationConditionIcon({
  location,
  className = "",
}: MapLocationConditionIconProps) {
  const intensity = getMarkerFogIntensity(location);
  const frameClass = `${desktopInsightIconFrameClass} ${className}`;

  if (intensity === "clear") {
    const isNight = isNighttime(new Date().getHours());

    return (
      <span
        className={`${frameClass} ${
          isNight ? desktopMistIconClass : desktopGoldIconClass
        }`}
      >
        {isNight ? (
          <MoonIcon className={desktopInsightIconSizeClass} />
        ) : (
          <SunshineIcon className={desktopInsightIconSizeClass} />
        )}
      </span>
    );
  }

  if (intensity === "lightFog") {
    return (
      <span className={`${frameClass} ${desktopMistIconClass}`}>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={desktopInsightIconSizeClass}
          fill="none"
        >
          <ellipse cx="12" cy="11" rx="6.8" ry="4" fill="#D8E8F4" opacity="0.92" />
          <ellipse cx="7.8" cy="12" rx="3.6" ry="2.8" fill="#EAF3FA" opacity="0.88" />
          <ellipse cx="16.2" cy="12" rx="3.6" ry="2.8" fill="#EAF3FA" opacity="0.88" />
          <ellipse cx="12" cy="9.8" rx="4.6" ry="2.8" fill="#F4F9FC" />
        </svg>
      </span>
    );
  }

  if (intensity === "karlTerritory") {
    return (
      <span
        className={`${frameClass} border-white/14 bg-white/[0.05]`}
      >
        <Image
          src={KARL_LOGO_SRC}
          alt=""
          aria-hidden="true"
          width={32}
          height={32}
          className={`${desktopInsightIconSizeClass} object-contain`}
        />
      </span>
    );
  }

  return (
    <span className={`${frameClass} ${desktopMistIconClass}`}>
      <FogCoverageIcon className={desktopInsightIconSizeClass} />
    </span>
  );
}
