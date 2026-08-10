import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import { MapRegionChips } from "@/components/map/MapRegionChips";

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
        <MapRegionChips
          selectedRegionId={selectedRegionId}
          onSelectRegion={onSelectRegion}
          variant="panel"
          layout="wrap"
          className={`flex flex-wrap gap-1.5 ${compact ? "mt-2" : "mt-3"}`}
        />
      ) : null}
    </div>
  );
}
