import {
  getFogIntensityLabel,
  type FogIntensity,
} from "@/lib/map/conditions";

const LEGEND_ITEMS: Array<{
  intensity: FogIntensity;
  className: string;
}> = [
  { intensity: "clear", className: "bg-karl-gold/85" },
  { intensity: "lightFog", className: "bg-white/45" },
  { intensity: "foggy", className: "bg-white/70" },
  { intensity: "karlTerritory", className: "bg-[rgb(184_214_237)]" },
];

export function MapFogLegend() {
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
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.className}`}
            />
            <span className="text-[0.68rem] text-white/70">
              {getFogIntensityLabel(item.intensity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
