"use client";

import { useEffect, useState } from "react";

import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import { DegradedDataLabel } from "@/components/weather/DegradedDataLabel";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";
import type { LocationWeather } from "@/lib/schemas/weather";

const PHONE_PORTRAIT_PANEL_CLASS =
  "rounded-2xl border border-[rgb(160_185_210/0.24)] bg-[rgb(6_15_27/0.92)] px-2.5 py-1.5 shadow-[0_10px_18px_rgb(0_0_0/0.45)]";

function getPhonePortraitConditionLine(
  item: BestRightNowItem,
  isTopRanked: boolean,
): string {
  const detail = item.detail?.trim();
  if (detail && detail !== "Clear skies") {
    return detail;
  }

  const scoreLabel = item.scoreLabel?.trim();
  if (scoreLabel) {
    const suffix = scoreLabel.replace(/^\d+\s+/, "").trim();
    if (suffix) {
      return suffix.charAt(0).toUpperCase() + suffix.slice(1);
    }
  }

  return isTopRanked ? "Clearest" : "";
}

type MapPhonePortraitUnifiedCardProps = {
  items: BestRightNowItem[];
  selectedLocation: LocationWeather | null;
  onSelectLocation: (locationId: string) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
  showBestRightNow?: boolean;
  emptyMessage?: string;
  title?: string;
};

export function MapPhonePortraitUnifiedCard({
  items,
  selectedLocation,
  onSelectLocation,
  onClearSelection,
  isLoading = false,
  showBestRightNow = true,
  emptyMessage,
  title = "Best Right Now",
}: MapPhonePortraitUnifiedCardProps) {
  const itemIds = items.map((item) => item.locationId).join("\0");
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    setVisibleIndex(0);
  }, [itemIds]);

  const handleCycle = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (items.length <= 1) {
      return;
    }

    setVisibleIndex((index) => (index + 1) % items.length);
    if (selectedLocation) {
      onClearSelection();
    }
  };

  if (isLoading) {
    return (
      <div className={`${PHONE_PORTRAIT_PANEL_CLASS} w-full px-4 py-3`}>
        <p className="text-xs text-white/50">Finding best spots…</p>
      </div>
    );
  }

  if (selectedLocation) {
    return (
      <section
        aria-label={`Selected location: ${selectedLocation.name}`}
        className={`${PHONE_PORTRAIT_PANEL_CLASS} w-full max-w-full`}
      >
        <div className="flex items-stretch gap-1.5">
          <MapSelectedLocationCard
            location={selectedLocation}
            onClose={onClearSelection}
            phonePortrait
            embedded
          />
          {showBestRightNow && items.length > 1 ? (
            <button
              type="button"
              aria-label="Show next Best Right Now location"
              onClick={handleCycle}
              className="flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full border border-white/10 bg-white/[0.04] text-base text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white/75 motion-reduce:transition-none"
            >
              ›
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  if (!showBestRightNow) {
    return null;
  }

  if (items.length === 0) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <section aria-label={title} className={`${PHONE_PORTRAIT_PANEL_CLASS} w-full max-w-full`}>
        <p className="px-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-karl-gold/90">
          {title}
        </p>
        <p className="mt-1 px-0.5 text-[0.6875rem] leading-snug text-white/55">
          {emptyMessage}
        </p>
      </section>
    );
  }

  const safeIndex = visibleIndex % items.length;
  const item = items[safeIndex];
  const conditionLine = getPhonePortraitConditionLine(item, safeIndex === 0);

  return (
    <section aria-label={title} className={`${PHONE_PORTRAIT_PANEL_CLASS} w-full max-w-full`}>
      <p className="px-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-karl-gold/90">
        {title}
      </p>
      <div className="mt-1 flex items-stretch gap-1.5">
        <button
          type="button"
          data-location-id={item.locationId}
          aria-label={`Select ${item.locationName} on map`}
          onClick={(event) => {
            event.stopPropagation();
            onSelectLocation(item.locationId);
          }}
          className="flex min-w-0 flex-1 flex-col gap-0 py-0.5 text-left transition-opacity hover:opacity-90 motion-reduce:transition-none"
        >
          <span className="truncate text-[0.6875rem] font-semibold leading-3 text-white">
            {item.locationName}
          </span>
          {item.score != null ? (
            <span className="text-sm font-semibold leading-4 text-karl-gold">
              {item.score}
            </span>
          ) : null}
          {conditionLine ? (
            <span className="truncate text-[0.5625rem] font-medium leading-[0.625rem] text-white/55">
              {conditionLine}
            </span>
          ) : null}
          {item.isDegraded ? (
            <DegradedDataLabel variant="bestRightNow" className="mt-px" />
          ) : null}
        </button>
        {items.length > 1 ? (
          <button
            type="button"
            aria-label="Show next Best Right Now location"
            onClick={handleCycle}
            className="flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full border border-white/10 bg-white/[0.04] text-base text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white/75 motion-reduce:transition-none"
          >
            ›
          </button>
        ) : null}
      </div>
    </section>
  );
}
