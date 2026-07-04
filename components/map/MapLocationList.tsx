import { GlassCard } from "@/components/ui/GlassCard";
import { getLocationConditionLabel } from "@/lib/map/conditions";
import { findBayAreaProductRegion, type BayAreaProductRegion } from "@/lib/map/config";
import {
  filterLocationsByProductRegion,
  getProductRegionNameForLocation,
} from "@/lib/map/regions";
import type { LocationWeather } from "@/lib/schemas/weather";

type MapLocationListProps = {
  locations: LocationWeather[];
  selectedLocationId: string | null;
  activeRegionId: BayAreaProductRegion["id"] | null;
  onSelectLocation: (locationId: string) => void;
  isLoading: boolean;
};

export function MapLocationList({
  locations,
  selectedLocationId,
  activeRegionId,
  onSelectLocation,
  isLoading,
}: MapLocationListProps) {
  if (isLoading) {
    return (
      <GlassCard className="px-4 py-4">
        <p className="text-sm text-white/55">Loading Bay Area locations…</p>
      </GlassCard>
    );
  }

  const visibleLocations = filterLocationsByProductRegion(
    locations,
    activeRegionId,
  ).filter((location) => location.id !== selectedLocationId);

  if (visibleLocations.length === 0) {
    return (
      <GlassCard className="px-4 py-4">
        <p className="text-sm text-white/60">
          {activeRegionId
            ? "No monitored locations in this region right now."
            : "No monitored locations available right now."}
        </p>
      </GlassCard>
    );
  }

  const heading = activeRegionId
    ? `${findBayAreaProductRegion(activeRegionId)?.name ?? "Bay Area"} Locations`
    : "Bay Area Locations";

  return (
    <section aria-label="Bay Area locations" className="space-y-2">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/45">
        {heading}
      </p>
      <div className="space-y-2">
        {visibleLocations.map((location) => (
          <MapLocationRow
            key={location.id}
            location={location}
            onSelect={() => onSelectLocation(location.id)}
          />
        ))}
      </div>
    </section>
  );
}

function MapLocationRow({
  location,
  onSelect,
}: {
  location: LocationWeather;
  onSelect: () => void;
}) {
  const regionName = getProductRegionNameForLocation(location) ?? "Bay Area";
  const conditionLabel = getLocationConditionLabel(location);

  return (
    <GlassCard className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-white/40">
            {regionName}
          </p>
          <h2 className="mt-1 text-base font-semibold text-white">
            {location.name}
          </h2>
          <p className="mt-1 text-sm text-white/65">{location.status}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-white/45">
            {conditionLabel}
          </p>
          <p className="mt-1.5 text-xs text-white/45">
            {location.distanceText} · {location.temperature}° · Clear{" "}
            {location.sunshineScore}
          </p>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="shrink-0 rounded-full border border-white/12 bg-karl-navy-glass/80 px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:border-karl-gold/30 hover:text-karl-gold motion-reduce:transition-none"
        >
          View on map
        </button>
      </div>
    </GlassCard>
  );
}
