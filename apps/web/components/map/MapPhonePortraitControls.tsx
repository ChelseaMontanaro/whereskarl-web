"use client";

import { useEffect, useRef } from "react";

import { MapLocationSearchBar } from "@/components/map/MapLocationSearchBar";
import { MapRegionChip } from "@/components/map/MapRegionChips";
import { BAY_AREA_PRODUCT_REGIONS } from "@/lib/map/config";
import type { CanonicalSearchableLocation } from "@whereskarl/search";

type SearchableMapLocation = CanonicalSearchableLocation;

type MapPhonePortraitControlsProps = {
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  isPhonePortrait?: boolean;
  /** Canonical map locations already loaded for markers — not a search-only catalog. */
  locations?: readonly SearchableMapLocation[];
  onSelectLocation?: (locationId: string) => void;
  /** Existing clear-selection / All Bay reset handler. */
  onClearSelectedLocation?: () => void;
};

/**
 * Phone-portrait top chrome: canonical search + horizontal region chips.
 * Search behavior lives in `MapLocationSearchBar` (shared with tablet/desktop).
 */
export function MapPhonePortraitControls({
  selectedRegionId,
  onSelectRegion,
  isPhonePortrait = false,
  locations = [],
  onSelectLocation,
  onClearSelectedLocation,
}: MapPhonePortraitControlsProps) {
  const chipRefs = useRef(new Map<string, HTMLButtonElement>());
  const chipScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPhonePortrait || !selectedRegionId) {
      return;
    }

    const selectedChip = chipRefs.current.get(selectedRegionId);
    const scrollContainer = chipScrollRef.current;
    if (!selectedChip || !scrollContainer) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior = prefersReducedMotion ? "auto" : "smooth";
    const edgePadding = 4;
    const chipStart = selectedChip.offsetLeft;
    const chipEnd = chipStart + selectedChip.offsetWidth;
    const viewStart = scrollContainer.scrollLeft;
    const viewEnd = viewStart + scrollContainer.clientWidth;

    let nextScroll = viewStart;
    if (chipStart - edgePadding < viewStart) {
      nextScroll = Math.max(0, chipStart - edgePadding);
    } else if (chipEnd + edgePadding > viewEnd) {
      nextScroll = chipEnd + edgePadding - scrollContainer.clientWidth;
    } else {
      return;
    }

    scrollContainer.scrollTo({ left: nextScroll, behavior });
  }, [isPhonePortrait, selectedRegionId]);

  if (!isPhonePortrait) {
    return null;
  }

  return (
    <div
      className="flex w-full flex-col items-center gap-1.5"
      aria-label="Bay Area regions"
    >
      {/* Horizontal inset: parent header is inset-x-3 (12px). Extra mx-1
          restores the approved ~16px side margin after viewport-fit=cover
          full-bleed, without shifting region chips. */}
      <MapLocationSearchBar
        locations={locations}
        onSelectLocation={onSelectLocation ?? (() => {})}
        onClearSelectedLocation={onClearSelectedLocation ?? (() => {})}
        restoreChrome
        testIdPrefix="map-phone-portrait-search"
        className="relative z-50 mx-1 mb-1"
      />

      <div
        ref={chipScrollRef}
        className="relative w-full overflow-x-auto scroll-px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-full items-center justify-center gap-1.5 px-0.5">
          {BAY_AREA_PRODUCT_REGIONS.map((region) => (
            <MapRegionChip
              key={region.id}
              region={region}
              isSelected={selectedRegionId === region.id}
              onSelect={() => onSelectRegion(region.id)}
              variant="phone"
              chipRef={(node) => {
                if (node) {
                  chipRefs.current.set(region.id, node);
                } else {
                  chipRefs.current.delete(region.id);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
