"use client";

import { useEffect, useRef } from "react";

import { BAY_AREA_PRODUCT_REGIONS } from "@/lib/map/config";

type MapPhonePortraitControlsProps = {
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  isPhonePortrait?: boolean;
};

/** Phase 16.3C.1 — visual-only Google Maps–style search chrome (not interactive yet). */
function MapPhonePortraitSearchBar() {
  return (
    <div
      className="pointer-events-none mb-1 flex w-full select-none items-center gap-2.5 rounded-full border border-[rgb(150_175_200/0.2)] bg-[rgb(5_13_24/0.88)] px-3.5 py-2.5"
      data-testid="map-phone-portrait-search-bar"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[1.125rem] w-[1.125rem] shrink-0 text-white/85"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16.2 16.2 20 20" />
      </svg>
      <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium leading-5 text-white/45">
        Search locations...
      </span>
      <svg
        viewBox="0 0 24 24"
        className="h-[1.125rem] w-[1.125rem] shrink-0 text-white/85"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 3.5a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0v-5a3 3 0 0 0-3-3Z" />
        <path d="M7.5 11.5a4.5 4.5 0 0 0 9 0" />
        <path d="M12 16v3.5" />
        <path d="M9.5 19.5h5" />
      </svg>
    </div>
  );
}

export function MapPhonePortraitControls({
  selectedRegionId,
  onSelectRegion,
  isPhonePortrait = false,
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

  if (isPhonePortrait) {
    return (
      <div className="flex w-full flex-col items-center gap-1.5" aria-label="Bay Area regions">
        <MapPhonePortraitSearchBar />

        <div
          ref={chipScrollRef}
          className="relative w-full overflow-x-auto scroll-px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max min-w-full items-center justify-center gap-1">
            {BAY_AREA_PRODUCT_REGIONS.map((region) => {
              const isSelected = selectedRegionId === region.id;

              return (
                <button
                  key={region.id}
                  ref={(node) => {
                    if (node) {
                      chipRefs.current.set(region.id, node);
                    } else {
                      chipRefs.current.delete(region.id);
                    }
                  }}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectRegion(region.id)}
                  className={`inline-flex min-w-[2.75rem] shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-2 py-2 text-center text-xs font-bold leading-[0.875rem] transition-opacity motion-reduce:transition-none ${
                    isSelected
                      ? "border-karl-gold/45 bg-karl-gold text-karl-navy"
                      : "border-[rgb(150_175_200/0.2)] bg-[rgb(5_13_24/0.78)] text-white/78 hover:opacity-90"
                  }`}
                >
                  {region.chipLabel}
                </button>
              );
            })}
          </div>
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
              {region.chipLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
