import {
  BAY_AREA_PRODUCT_REGIONS,
  type BayAreaProductRegion,
} from "@/lib/map/config";
import {
  MAP_REGION_CHIP_BASE_CLASS,
  MAP_REGION_CHIP_PANEL_IDLE_CLASS,
  MAP_REGION_CHIP_PANEL_SELECTED_CLASS,
} from "@/lib/map/mapChrome";

type MapRegionChipsProps = {
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
};

export function MapRegionChips({
  selectedRegionId,
  onSelectRegion,
}: MapRegionChipsProps) {
  return (
    <div
      aria-label="Bay Area regions"
      className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {BAY_AREA_PRODUCT_REGIONS.map((region) => (
        <RegionChip
          key={region.id}
          region={region}
          isSelected={selectedRegionId === region.id}
          onSelect={() => onSelectRegion(region.id)}
        />
      ))}
    </div>
  );
}

function RegionChip({
  region,
  isSelected,
  onSelect,
}: {
  region: BayAreaProductRegion;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`${MAP_REGION_CHIP_BASE_CLASS} ${
        isSelected
          ? MAP_REGION_CHIP_PANEL_SELECTED_CLASS
          : MAP_REGION_CHIP_PANEL_IDLE_CLASS
      }`}
    >
      {region.chipLabel}
    </button>
  );
}
