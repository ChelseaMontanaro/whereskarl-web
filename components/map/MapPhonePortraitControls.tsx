"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { BAY_AREA_PRODUCT_REGIONS } from "@/lib/map/config";
import { filterCanonicalLocationsBySearch } from "@/lib/map/locationSearch";
import { restorePhoneMapChrome } from "@/lib/map/restorePhoneMapChrome";

type SearchableMapLocation = {
  id: string;
  name: string;
};

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

type MapPhonePortraitSearchBarProps = {
  locations: readonly SearchableMapLocation[];
  onSelectLocation: (locationId: string) => void;
  onClearSelectedLocation: () => void;
};

function SearchMagnifierIcon() {
  return (
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
  );
}

function SearchMicIcon() {
  return (
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
  );
}

/** Phase 16.3C.1b — interactive canonical location search (phone portrait). */
function MapPhonePortraitSearchBar({
  locations,
  onSelectLocation,
  onClearSelectedLocation,
}: MapPhonePortraitSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(() => {
    if (query.trim().length === 0) {
      return [];
    }
    return filterCanonicalLocationsBySearch(locations, query);
  }, [locations, query]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const closeOverlay = () => {
    setIsOverlayOpen(false);
    setActiveIndex(-1);
  };

  const dismissKeyboardAndOverlay = () => {
    closeOverlay();
    inputRef.current?.blur();
    restorePhoneMapChrome();
  };

  useEffect(() => {
    if (!isOverlayOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root || root.contains(event.target as Node)) {
        return;
      }
      setIsOverlayOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      restorePhoneMapChrome();
    };

    // Bind on the next tick so the opening tap cannot immediately dismiss.
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOverlayOpen]);

  const handleSelectResult = (location: SearchableMapLocation) => {
    // Deterministic sync sequence (ghost expansion blocked by sheet key-remount
    // + surface-arm — not by deferring overlay close):
    // 1) close overlay  2–3) blur / dismiss keyboard  4–5) restore chrome
    // 6–8) canonical select + fly-to + shared sheet (via MapView)
    setQuery(location.name);
    closeOverlay();
    inputRef.current?.blur();
    restorePhoneMapChrome();
    onSelectLocation(location.id);
  };

  const handleClear = () => {
    // Sync clear: text → overlay → blur → chrome → canonical reset / All Bay.
    setQuery("");
    closeOverlay();
    inputRef.current?.blur();
    restorePhoneMapChrome();
    onClearSelectedLocation();
  };

  const hasSearchText = query.trim().length > 0;
  const hasQuery = query.length > 0;
  const showOverlay = isOverlayOpen;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showOverlay && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOverlayOpen(true);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      dismissKeyboardAndOverlay();
      return;
    }

    if (!showOverlay || !hasSearchText) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.length === 0) {
        return;
      }
      setActiveIndex((current) =>
        current < results.length - 1 ? current + 1 : 0,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length === 0) {
        return;
      }
      setActiveIndex((current) =>
        current > 0 ? current - 1 : results.length - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      handleSelectResult(results[activeIndex]);
    }
  };

  return (
    // Horizontal inset: parent header is inset-x-3 (12px). Extra mx-1 restores
    // the approved ~16px (inset-x-4) side margin after viewport-fit=cover
    // full-bleed, without shifting region chips.
    <div ref={rootRef} className="relative z-50 mx-1 mb-1">
      <div
        className="relative z-50 flex w-full items-center gap-2.5 rounded-full border border-[rgb(150_175_200/0.2)] bg-[rgb(5_13_24/0.88)] px-3.5 py-2.5"
        data-testid="map-phone-portrait-search-bar"
      >
        <SearchMagnifierIcon />
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Search locations..."
          aria-label="Search locations"
          aria-autocomplete="list"
          aria-controls={hasSearchText ? listboxId : undefined}
          aria-expanded={showOverlay}
          aria-activedescendant={
            showOverlay &&
            hasSearchText &&
            activeIndex >= 0 &&
            results[activeIndex]
              ? `${listboxId}-option-${results[activeIndex].id}`
              : undefined
          }
          role="combobox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          // Platform compatibility — keep this input at >=16px (text-[16px]).
          // iOS WebKit auto-zooms focused form controls below 16px; Safari and
          // Chrome on iOS both use WebKit. That auto-zoom changes the visual
          // viewport so fixed-position UI (BottomNav, shared selected-location
          // BottomSheet) can appear shifted or clipped. This is browser
          // behavior, not an AppShell or BottomSheet bug. The 16px floor is an
          // intentional requirement — polish via container, padding, icons, or
          // line-height; do not shrink the actual input font below 16px.
          className="min-w-0 flex-1 bg-transparent text-[16px] font-medium leading-5 text-white outline-none placeholder:text-white/45 [&::-webkit-search-cancel-button]:hidden"
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOverlayOpen(true);
          }}
          onFocus={() => setIsOverlayOpen(true)}
          onClick={() => setIsOverlayOpen(true)}
          onBlur={() => {
            // Keyboard Done / focus loss must not leave a compressed visual
            // viewport latching the bottom nav off-screen.
            restorePhoneMapChrome();
          }}
          onKeyDown={handleKeyDown}
        />
        {hasQuery ? (
          <button
            type="button"
            aria-label="Clear search"
            className="inline-flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center text-white/85"
            onClick={handleClear}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[1.125rem] w-[1.125rem]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        ) : (
          <SearchMicIcon />
        )}
      </div>

      {showOverlay ? (
        <div
          className={`absolute left-0 right-0 top-full z-50 mt-1 rounded-2xl border border-[rgb(150_175_200/0.22)] bg-[rgb(5_13_24/0.94)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
            hasSearchText
              ? "max-h-[min(18rem,calc(100dvh-8.5rem))] overflow-y-auto overscroll-contain py-1"
              : "flex min-h-[3.25rem] items-center justify-center px-3.5 py-3"
          }`}
          data-testid="map-phone-portrait-search-results"
        >
          {!hasSearchText ? (
            <p
              className="flex items-center justify-center gap-2 text-center text-sm font-medium text-white/45"
              data-testid="map-phone-portrait-search-empty"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 shrink-0 text-white/40"
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
              Start typing to search locations
            </p>
          ) : results.length === 0 ? (
            <p className="px-3.5 py-3 text-sm font-medium text-white/55">
              No matching locations
            </p>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Location search results">
              {results.map((location, index) => {
                const isActive = index === activeIndex;
                return (
                  <li key={location.id} role="presentation">
                    <button
                      type="button"
                      id={`${listboxId}-option-${location.id}`}
                      role="option"
                      aria-selected={isActive}
                      className={`flex w-full items-center px-3.5 py-2.5 text-left text-[0.9375rem] font-medium leading-5 text-white/90 ${
                        isActive ? "bg-white/10" : "hover:bg-white/8"
                      }`}
                      onMouseDown={(event) => {
                        // Keep focus handling deterministic before click selection.
                        event.preventDefault();
                      }}
                      onClick={() => handleSelectResult(location)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      {location.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

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

  if (isPhonePortrait) {
    return (
      <div className="flex w-full flex-col items-center gap-1.5" aria-label="Bay Area regions">
        <MapPhonePortraitSearchBar
          locations={locations}
          onSelectLocation={onSelectLocation ?? (() => {})}
          onClearSelectedLocation={onClearSelectedLocation ?? (() => {})}
        />

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
