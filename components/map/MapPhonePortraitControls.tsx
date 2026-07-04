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

type MapPhonePortraitControlsProps = {
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
};

export function MapPhonePortraitControls({
  selectedRegionId,
  onSelectRegion,
}: MapPhonePortraitControlsProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div aria-label="Bay Area map conditions summary">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-karl-gold/90">
          Karl around the Bay
        </p>
        <h1 className="mt-0.5 text-[0.95rem] font-semibold tracking-tight text-white">
          Bay Area conditions
        </h1>
      </div>

      <div aria-label="Bay Area regions" className="flex flex-wrap gap-1">
        {BAY_AREA_PRODUCT_REGIONS.map((region) => {
          const isSelected = selectedRegionId === region.id;

          return (
            <button
              key={region.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectRegion(region.id)}
              className={`rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold transition-colors motion-reduce:transition-none ${
                isSelected
                  ? "border-karl-gold/40 bg-karl-gold/14 text-karl-gold"
                  : "border-white/10 bg-black/28 text-white/65 backdrop-blur-sm hover:border-white/18 hover:text-white/85"
              }`}
            >
              {REGION_CHIP_LABELS[region.id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
