import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import { BAY_AREA_PRODUCT_REGIONS } from "@/lib/map/config";
import {
  MAP_REGION_CHIP_BASE_CLASS,
  MAP_REGION_CHIP_PANEL_IDLE_CLASS,
  MAP_REGION_CHIP_PANEL_SELECTED_CLASS,
} from "@/lib/map/mapChrome";

const MAP_CONDITIONS_SUBTITLE =
  "Explore live fog & clear skies around the Bay.";

type MapConditionsPanelProps = {
  isLoading?: boolean;
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string) => void;
  compact?: boolean;
};

export function MapConditionsPanel({
  isLoading = false,
  selectedRegionId = null,
  onSelectRegion,
  compact = false,
}: MapConditionsPanelProps) {
  return (
    <div
      className={`${desktopGlassCardClass} w-full ${
        compact ? "px-3 py-2.5" : "px-4 py-3.5"
      }`}
      aria-label="Bay Area map conditions summary"
    >
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-karl-gold/90">
        Karl around the Bay
      </p>
      <h1
        className={`font-semibold tracking-tight text-white ${
          compact ? "mt-1 text-base" : "mt-1.5 text-lg"
        }`}
      >
        Bay Area conditions
      </h1>
      <p
        className={`leading-relaxed text-white/72 ${
          compact ? "mt-1.5 text-xs" : "mt-2 text-sm"
        }`}
      >
        {isLoading ? "Checking live conditions…" : MAP_CONDITIONS_SUBTITLE}
      </p>

      {onSelectRegion ? (
        <div
          aria-label="Bay Area regions"
          className={`flex flex-wrap gap-1.5 ${compact ? "mt-2" : "mt-3"}`}
        >
          {BAY_AREA_PRODUCT_REGIONS.map((region) => {
            const isSelected = selectedRegionId === region.id;

            return (
              <button
                key={region.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectRegion(region.id)}
                className={`${MAP_REGION_CHIP_BASE_CLASS} ${
                  isSelected
                    ? MAP_REGION_CHIP_PANEL_SELECTED_CLASS
                    : MAP_REGION_CHIP_PANEL_IDLE_CLASS
                }`}
              >
                {region.chipLabel}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
