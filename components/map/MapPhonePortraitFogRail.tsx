"use client";

import type { FogIntensity } from "@/lib/map/conditions";
import { getFogIntensityLabel } from "@/lib/map/conditions";
import { getPhonePortraitConditionIconDataUri } from "@/lib/map/phonePortraitConditionIcons";

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
  return (
    <aside
      aria-label="Fog intensity filter"
      className="flex w-[4.5rem] flex-col gap-1.5 rounded-2xl border border-[rgb(150_175_200/0.18)] bg-[rgb(5_13_24/0.82)] px-1.5 py-2 shadow-[0_6px_12px_rgb(0_0_0/0.32)]"
    >
      <p className="text-center text-[0.5625rem] font-extrabold uppercase leading-3 tracking-[0.05em] text-white/90">
        Fog
        <br />
        Intensity
      </p>

      <div className="flex flex-col gap-1.5">
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
              className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] px-0.5 py-1.5 transition-opacity motion-reduce:transition-none ${
                isActive
                  ? "border-karl-gold bg-[rgb(20_30_44/0.9)]"
                  : "border-[rgb(150_175_200/0.13)] bg-[rgb(16_28_44/0.45)] hover:opacity-90"
              }`}
            >
              <img
                src={getPhonePortraitConditionIconDataUri(intensity)}
                alt=""
                width={28}
                height={28}
                aria-hidden
                className="h-7 w-7"
              />
              <span
                className={`text-center text-[0.625rem] font-semibold leading-3 ${
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
