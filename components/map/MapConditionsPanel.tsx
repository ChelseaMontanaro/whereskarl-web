import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import {
  BAY_AREA_PRODUCT_REGIONS,
  type BayAreaProductRegion,
} from "@/lib/map/config";

const REGION_CHIP_LABELS: Record<BayAreaProductRegion["id"], string> = {
  "san-francisco": "SF",
  "north-bay": "North Bay",
  "east-bay": "East Bay",
  "south-bay": "South Bay",
};

const MAP_CONDITIONS_SUBTITLE =
  "Explore live fog & clear skies across the Bay Area.";

type MapConditionsPanelProps = {
  isLoading?: boolean;
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string) => void;
};

export function MapConditionsPanel({
  isLoading = false,
  selectedRegionId = null,
  onSelectRegion,
}: MapConditionsPanelProps) {
  return (
    <div
      className={`${desktopGlassCardClass} max-w-xs px-4 py-3.5`}
      aria-label="Bay Area map conditions summary"
    >
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-karl-gold/90">
        Karl around the Bay
      </p>
      <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
        Bay Area conditions
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-white/72">
        {isLoading ? "Checking live conditions…" : MAP_CONDITIONS_SUBTITLE}
      </p>

      {onSelectRegion ? (
        <div
          aria-label="Bay Area regions"
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {BAY_AREA_PRODUCT_REGIONS.map((region) => {
            const isSelected = selectedRegionId === region.id;

            return (
              <button
                key={region.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectRegion(region.id)}
                className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold transition-colors motion-reduce:transition-none ${
                  isSelected
                    ? "border-karl-gold/40 bg-karl-gold/14 text-karl-gold"
                    : "border-white/10 bg-white/[0.04] text-white/65 hover:border-white/18 hover:text-white/85"
                }`}
              >
                {REGION_CHIP_LABELS[region.id]}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
