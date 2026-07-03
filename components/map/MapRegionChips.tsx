import {
  BAY_AREA_PRODUCT_REGIONS,
  type BayAreaProductRegion,
} from "@/lib/map/config";

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
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
      className={`shrink-0 rounded-full border px-3 py-2 text-left transition-colors motion-reduce:transition-none ${
        isSelected
          ? "border-karl-gold/40 bg-karl-gold/14 text-karl-gold"
          : "border-white/10 bg-karl-navy-glass/70 text-white/75 hover:border-white/20 hover:text-white"
      }`}
    >
      <span className="block text-[0.625rem] font-bold uppercase tracking-[0.12em]">
        {region.name}
      </span>
    </button>
  );
}
