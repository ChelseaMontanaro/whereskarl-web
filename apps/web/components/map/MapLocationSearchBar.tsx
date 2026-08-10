"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import {
  filterCanonicalLocationsBySearch,
  type CanonicalSearchableLocation,
} from "@whereskarl/search";
import { restorePhoneMapChrome } from "@/lib/map/restorePhoneMapChrome";

type SearchableMapLocation = CanonicalSearchableLocation;

export type MapLocationSearchBarProps = {
  locations: readonly SearchableMapLocation[];
  onSelectLocation: (locationId: string) => void;
  onClearSelectedLocation: () => void;
  /**
   * Phone portrait must restore fixed bottom chrome after keyboard dismissal.
   * Desktop/tablet leave this off — there is no phone chrome recovery path.
   */
  restoreChrome?: boolean;
  /** Extra classes for the outer search root (inset / width). */
  className?: string;
  /**
   * Test id prefix. Phone keeps `map-phone-portrait-search` so chrome recovery
   * and existing contracts stay stable; tablet/desktop use the shared default.
   */
  testIdPrefix?: string;
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

/**
 * Canonical map location search — one implementation for phone, tablet, and
 * desktop. Matching uses `@whereskarl/search`; selection stays URL-canonical
 * via the parent `onSelectLocation` / `onClearSelectedLocation` handlers.
 */
export function MapLocationSearchBar({
  locations,
  onSelectLocation,
  onClearSelectedLocation,
  restoreChrome = false,
  className = "relative z-50 mx-1 mb-1",
  testIdPrefix = "map-location-search",
}: MapLocationSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const restoreChromeIfNeeded = () => {
    if (restoreChrome) {
      restorePhoneMapChrome();
    }
  };

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
    restoreChromeIfNeeded();
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
      restoreChromeIfNeeded();
    };

    // Bind on the next tick so the opening tap cannot immediately dismiss.
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOverlayOpen, restoreChrome]);

  const handleSelectResult = (location: SearchableMapLocation) => {
    // Deterministic sync sequence (ghost expansion blocked by sheet key-remount
    // + surface-arm — not by deferring overlay close):
    // 1) close overlay  2–3) blur / dismiss keyboard  4–5) restore chrome
    // 6–8) canonical select + fly-to + shared sheet (via MapView)
    setQuery(location.name);
    closeOverlay();
    inputRef.current?.blur();
    restoreChromeIfNeeded();
    onSelectLocation(location.id);
  };

  const handleClear = () => {
    // Sync clear: text → overlay → blur → chrome → canonical reset / All Bay.
    setQuery("");
    closeOverlay();
    inputRef.current?.blur();
    restoreChromeIfNeeded();
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
    <div ref={rootRef} className={className}>
      <div
        className="relative z-50 flex w-full items-center gap-2.5 rounded-full border border-[rgb(150_175_200/0.2)] bg-[rgb(5_13_24/0.88)] px-3.5 py-2.5"
        data-testid={`${testIdPrefix}-bar`}
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
            restoreChromeIfNeeded();
          }}
          onKeyDown={handleKeyDown}
        />
        {hasQuery ? (
          <button
            type="button"
            aria-label="Clear search"
            className="-mr-1.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karl-gold/50"
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
        ) : null}
      </div>

      {showOverlay ? (
        <div
          className={`absolute left-0 right-0 top-full z-50 mt-1 rounded-2xl border border-[rgb(150_175_200/0.22)] bg-[rgb(5_13_24/0.94)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
            hasSearchText
              ? "max-h-[min(18rem,calc(100dvh-8.5rem))] overflow-y-auto overscroll-contain py-1"
              : "flex min-h-[3.25rem] items-center justify-center px-3.5 py-3"
          }`}
          data-testid={`${testIdPrefix}-results`}
        >
          {!hasSearchText ? (
            <p
              className="flex items-center justify-center gap-2 text-center text-sm font-medium text-white/45"
              data-testid={`${testIdPrefix}-empty`}
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
