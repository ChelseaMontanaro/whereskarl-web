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
  variant?: "default" | "prominent";
};

export function MapLocationConditionIcon({
  location,
  className = "",
  variant = "default",
}: MapLocationConditionIconProps) {
  const intensity = getMarkerFogIntensity(location);
  const isProminent = variant === "prominent";
  const frameClass = isProminent
    ? `flex shrink-0 items-center justify-center rounded-full border lg:h-16 lg:w-16 ${className}`
    : `${desktopInsightIconFrameClass} ${className}`;
  const iconClass = isProminent ? "h-9 w-9" : desktopInsightIconSizeClass;

  if (intensity === "clear") {
    const isNight = isNighttime(new Date().getHours());

    return (
      <span
        className={`${frameClass} ${
          isNight
            ? `${desktopMistIconClass} shadow-[0_0_0_1px_rgb(255_255_255_/_0.08)]`
            : `${desktopGoldIconClass} shadow-[0_0_0_1px_rgb(242_163_38_/_0.18),0_8px_24px_rgb(242_163_38_/_0.12)]`
        }`}
      >
        {isNight ? (
          <MoonIcon className={iconClass} />
        ) : (
          <SunshineIcon className={iconClass} />
        )}
      </span>
    );
  }

  if (intensity === "lightFog") {
    return (
      <span
        className={`${frameClass} ${desktopMistIconClass} shadow-[0_0_0_1px_rgb(255_255_255_/_0.08)]`}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={iconClass}
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
        className={`${frameClass} border-white/14 bg-white/[0.05] shadow-[0_0_0_1px_rgb(255_255_255_/_0.08)]`}
      >
        <Image
          src={KARL_LOGO_SRC}
          alt=""
          aria-hidden="true"
          width={36}
          height={36}
          className={`${iconClass} object-contain`}
        />
      </span>
    );
  }

  return (
    <span
      className={`${frameClass} ${desktopMistIconClass} shadow-[0_0_0_1px_rgb(255_255_255_/_0.08)]`}
    >
      <FogCoverageIcon className={iconClass} />
    </span>
  );
}
