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
  isPhonePortrait?: boolean;
};

export function MapPhonePortraitControls({
  selectedRegionId,
  onSelectRegion,
  isPhonePortrait = false,
}: MapPhonePortraitControlsProps) {
  if (isPhonePortrait) {
    return (
      <div className="flex w-full flex-col items-center gap-1.5" aria-label="Bay Area regions">
        <h1 className="mb-1 text-center font-serif text-[1.1875rem] font-semibold leading-6 tracking-wide text-karl-gold">
          Karl Around the Bay
        </h1>

        <div className="flex w-full items-center justify-center gap-1.5">
          {BAY_AREA_PRODUCT_REGIONS.map((region) => {
            const isSelected = selectedRegionId === region.id;

            return (
              <button
                key={region.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectRegion(region.id)}
                className={`min-w-0 flex-1 rounded-full border px-2 py-2 text-center text-xs font-bold leading-[0.875rem] transition-opacity motion-reduce:transition-none ${
                  isSelected
                    ? "border-karl-gold/45 bg-karl-gold text-karl-navy"
                    : "border-[rgb(150_175_200/0.2)] bg-[rgb(5_13_24/0.78)] text-white/78 hover:opacity-90"
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
