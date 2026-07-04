import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import {
  getFogIntensityLabel,
  type FogIntensity,
} from "@/lib/map/conditions";

const LEGEND_ITEMS: Array<{
  intensity: FogIntensity;
  swatchClassName: string;
}> = [
  { intensity: "clear", swatchClassName: "bg-karl-gold" },
  { intensity: "lightFog", swatchClassName: "bg-[#9A9590]" },
  { intensity: "foggy", swatchClassName: "bg-[#F0F4F8]" },
  { intensity: "karlTerritory", swatchClassName: "bg-[#B8D4EA]" },
];

type MapFogLegendProps = {
  layout?: "mobile" | "desktop" | "desktop-stack" | "immersive-strip";
  activeIntensity?: FogIntensity | null;
  onSelectIntensity?: (intensity: FogIntensity) => void;
};

function LegendSwatch({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/10 ${className}`}
    />
  );
}

export function MapFogLegend({
  layout = "mobile",
  activeIntensity = null,
  onSelectIntensity,
}: MapFogLegendProps) {
  if (layout === "immersive-strip") {
    const isInteractive = Boolean(onSelectIntensity);

    return (
      <div
        aria-label="Fog intensity legend"
        className={`${desktopGlassCardClass} max-w-full px-2.5 py-2`}
      >
        <p className="px-0.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white/38">
          Fog Intensity
        </p>
        <ul className="mt-1.5 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LEGEND_ITEMS.map((item) => {
            const isActive = activeIntensity === item.intensity;
            const label = getFogIntensityLabel(item.intensity);

            if (isInteractive) {
              return (
                <li key={item.intensity} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-label={label}
                    onClick={() => onSelectIntensity?.(item.intensity)}
                    className={`flex items-center gap-1 rounded-full border px-2 py-1 text-left transition-colors motion-reduce:transition-none ${
                      isActive
                        ? "border-karl-gold/35 bg-karl-gold/10 text-karl-gold"
                        : "border-white/10 bg-white/[0.03] text-white/58 hover:border-white/18 hover:text-white/75"
                    }`}
                  >
                    <LegendSwatch className={item.swatchClassName} />
                    <span className="text-[0.62rem] whitespace-nowrap">{label}</span>
                  </button>
                </li>
              );
            }

            return (
              <li
                key={item.intensity}
                className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1"
              >
                <LegendSwatch className={item.swatchClassName} />
                <span className="text-[0.62rem] whitespace-nowrap text-white/58">
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (layout === "desktop-stack") {
    const isInteractive = Boolean(onSelectIntensity);

    return (
      <div
        aria-label="Fog intensity legend"
        className={`${desktopGlassCardClass} max-w-xs px-3 py-2`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white/38">
            Fog Intensity
          </p>
        </div>
        <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
          {LEGEND_ITEMS.map((item) => {
            const isActive = activeIntensity === item.intensity;
            const label = getFogIntensityLabel(item.intensity);

            if (isInteractive) {
              return (
                <li key={item.intensity}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-label={label}
                    onClick={() => onSelectIntensity?.(item.intensity)}
                    className={`flex w-full items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition-colors motion-reduce:transition-none ${
                      isActive
                        ? "bg-karl-gold/10 text-karl-gold"
                        : "text-white/58 hover:bg-white/[0.04] hover:text-white/75"
                    }`}
                  >
                    <LegendSwatch className={item.swatchClassName} />
                    <span className="text-[0.62rem]">{label}</span>
                  </button>
                </li>
              );
            }

            return (
              <li key={item.intensity} className="flex items-center gap-1.5">
                <LegendSwatch className={item.swatchClassName} />
                <span className="text-[0.62rem] text-white/58">{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (layout === "desktop") {
    return (
      <div
        aria-label="Fog intensity legend"
        className={`${desktopGlassCardClass} w-44 px-3 py-2.5`}
      >
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/45">
          Fog Intensity
        </p>
        <ul className="mt-2 space-y-1.5">
          {LEGEND_ITEMS.map((item) => (
            <li key={item.intensity} className="flex items-center gap-2">
              <LegendSwatch className={item.swatchClassName} />
              <span className="text-[0.68rem] text-white/70">
                {getFogIntensityLabel(item.intensity)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      aria-label="Fog intensity legend"
      className="pointer-events-none absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-white/10 bg-karl-navy/84 px-3 py-2.5 backdrop-blur-sm"
    >
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/45">
        Fog Intensity
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.intensity} className="flex items-center gap-2">
            <LegendSwatch className={item.swatchClassName} />
            <span className="text-[0.68rem] text-white/70">
              {getFogIntensityLabel(item.intensity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
