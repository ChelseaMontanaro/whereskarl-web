"use client";

import { KarlLogo } from "@/components/brand/KarlLogo";
import {
  insightGlassCardClass,
  mobileInsightGlassHighlightClass,
} from "@/components/home/desktopGlass";
import type { FogIntensity } from "@/lib/map/conditions";
import { getFogIntensityLabel } from "@/lib/map/conditions";
import { getPhonePortraitFogRailConditionIconDataUri } from "@/lib/map/phonePortraitConditionIcons";
import { useIsNighttime } from "@/lib/hooks/useIsNighttime";

const RAIL_INTENSITIES: FogIntensity[] = [
  "clear",
  "lightFog",
  "foggy",
  "karlTerritory",
];

type MapPhonePortraitFogRailProps = {
  activeIntensity: FogIntensity | null;
  onSelectIntensity: (intensity: FogIntensity) => void;
};

export function MapPhonePortraitFogRail({
  activeIntensity,
  onSelectIntensity,
}: MapPhonePortraitFogRailProps) {
  const isNighttime = useIsNighttime();

  return (
    <aside
      aria-label="Fog intensity filter"
      className={`flex w-[3.125rem] flex-col gap-1 px-[3px] py-1 ${insightGlassCardClass}`}
    >
      <div aria-hidden="true" className={mobileInsightGlassHighlightClass} />
      <p className="text-center text-[0.4375rem] font-extrabold uppercase leading-[0.5625rem] tracking-[0.02em] text-white/90">
        Fog
        <br />
        Intensity
      </p>

      <div className="flex flex-col gap-1">
        {RAIL_INTENSITIES.map((intensity) => {
          const isActive = activeIntensity === intensity;
          const label = getFogIntensityLabel(intensity);

          return (
            <button
              key={intensity}
              type="button"
              aria-pressed={isActive}
              aria-label={label}
              onClick={() => onSelectIntensity(intensity)}
              className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl border-[1.5px] px-0 py-0 transition-opacity motion-reduce:transition-none ${
                isActive
                  ? "border-karl-gold bg-[rgb(20_30_44/0.9)]"
                  : "border-[rgb(150_175_200/0.13)] bg-[rgb(16_28_44/0.45)] hover:opacity-90"
              }`}
            >
              {intensity === "karlTerritory" ? (
                <KarlLogo className="h-6 w-6" />
              ) : (
                <img
                  src={getPhonePortraitFogRailConditionIconDataUri(intensity, {
                    isNighttime,
                  })}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                  className="h-6 w-6"
                />
              )}
              <span
                className={`text-center text-[0.5rem] font-semibold leading-[0.5625rem] tracking-[-0.01em] ${
                  isActive ? "font-bold text-karl-gold" : "text-white/85"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
