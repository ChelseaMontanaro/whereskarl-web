import {
  BAY_AREA_PRODUCT_REGIONS,
  type BayAreaProductRegion,
} from "@/lib/map/config";
import {
  mapRegionChipClassName,
  type MapRegionChipVariant,
} from "@/lib/map/mapChrome";

type MapRegionChipProps = {
  region: BayAreaProductRegion;
  isSelected: boolean;
  onSelect: () => void;
  variant?: MapRegionChipVariant;
  chipRef?: (node: HTMLButtonElement | null) => void;
};

export function MapRegionChip({
  region,
  isSelected,
  onSelect,
  variant = "panel",
  chipRef,
}: MapRegionChipProps) {
  return (
    <button
      ref={chipRef}
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={mapRegionChipClassName(variant, isSelected)}
    >
      {region.chipLabel}
    </button>
  );
}

type MapRegionChipsProps = {
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  variant?: MapRegionChipVariant;
  /**
   * `scroll` — single-row horizontal chips (phone).
   * `wrap` — flex-wrap panel chips (tablet/desktop conditions).
   */
  layout?: "scroll" | "wrap";
  className?: string;
  onChipRef?: (regionId: string, node: HTMLButtonElement | null) => void;
};

export function MapRegionChips({
  selectedRegionId,
  onSelectRegion,
  variant = "panel",
  layout = "wrap",
  className,
  onChipRef,
}: MapRegionChipsProps) {
  const chips = BAY_AREA_PRODUCT_REGIONS.map((region) => (
    <MapRegionChip
      key={region.id}
      region={region}
      isSelected={selectedRegionId === region.id}
      onSelect={() => onSelectRegion(region.id)}
      variant={variant}
      chipRef={
        onChipRef
          ? (node) => onChipRef(region.id, node)
          : undefined
      }
    />
  ));

  if (layout === "scroll") {
    return (
      <div
        aria-label="Bay Area regions"
        className={
          className ??
          "flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
      >
        {chips}
      </div>
    );
  }

  return (
    <div
      aria-label="Bay Area regions"
      className={className ?? "flex flex-wrap gap-1.5"}
    >
      {chips}
    </div>
  );
}
