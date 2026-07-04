"use client";

import { useState } from "react";

import { desktopGlassCardClass } from "@/components/home/desktopGlass";
import {
  KARL_MAP_STYLE_OPTIONS,
  type KarlMapStyleId,
} from "@/lib/map/styles";

type MapLayerControlsProps = {
  mapStyle: KarlMapStyleId;
  fogLayerEnabled: boolean;
  onMapStyleChange: (styleId: KarlMapStyleId) => void;
  onFogLayerChange: (enabled: boolean) => void;
  layout?: "mobile" | "desktop" | "immersive";
  onZoomIn?: () => void;
  onZoomOut?: () => void;
};

function ZoomButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-lg font-light text-white/80 transition-colors hover:bg-white/[0.06] hover:text-karl-gold motion-reduce:transition-none"
    >
      {label === "Zoom in" ? "+" : "−"}
    </button>
  );
}

function LayersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    </svg>
  );
}

function RadioIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
        checked ? "border-karl-gold" : "border-white/30"
      }`}
    >
      {checked ? (
        <span className="h-1.5 w-1.5 rounded-full bg-karl-gold" />
      ) : null}
    </span>
  );
}

function LayerPanelContent({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  vertical = false,
}: Pick<
  MapLayerControlsProps,
  "mapStyle" | "fogLayerEnabled" | "onMapStyleChange" | "onFogLayerChange"
> & { vertical?: boolean }) {
  return (
    <div className={vertical ? "space-y-3" : "mt-4 space-y-4"}>
      <section aria-label="Map style">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/45">
          Map Style
        </p>
        {vertical ? (
          <div
            role="radiogroup"
            aria-label="Map style"
            className="mt-2 space-y-1.5"
          >
            {KARL_MAP_STYLE_OPTIONS.map((option) => {
              const isSelected = mapStyle === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onMapStyleChange(option.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors motion-reduce:transition-none ${
                    isSelected
                      ? "border-karl-gold/35 bg-karl-gold/10 text-karl-gold"
                      : "border-white/10 bg-karl-navy-glass/70 text-white/75 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <RadioIndicator checked={isSelected} />
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {KARL_MAP_STYLE_OPTIONS.map((option) => {
              const isSelected = mapStyle === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onMapStyleChange(option.id)}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors motion-reduce:transition-none ${
                    isSelected
                      ? "border-karl-gold/35 bg-karl-gold/12 text-karl-gold"
                      : "border-white/10 bg-karl-navy-glass/70 text-white/70 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section aria-label="Overlays">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/45">
          Overlays
        </p>
        <label className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-karl-navy-glass/70 px-3 py-2.5">
          <span className="text-sm text-white/80">Fog Layer</span>
          <input
            type="checkbox"
            checked={fogLayerEnabled}
            onChange={(event) => onFogLayerChange(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-karl-navy text-karl-gold focus:ring-karl-gold/40"
          />
        </label>
      </section>
    </div>
  );
}

export function MapLayerControls({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  layout = "mobile",
  onZoomIn,
  onZoomOut,
}: MapLayerControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  if (layout === "desktop" || layout === "immersive") {
    const panelId =
      layout === "immersive"
        ? "map-layer-panel-immersive"
        : "map-layer-panel-desktop";

    return (
      <div
        className={`absolute z-10 flex flex-col items-end gap-2 ${
          layout === "immersive"
            ? "right-3 top-3 w-[min(100%,15rem)] sm:right-4 sm:top-4 md:top-[4.5rem]"
            : "right-5 top-[5.5rem] w-[min(100%,17rem)]"
        }`}
      >
        <div
          className={`${desktopGlassCardClass} flex flex-col items-center p-1`}
          aria-label="Map zoom controls"
        >
          <ZoomButton label="Zoom in" onClick={onZoomIn} />
          <div className="my-0.5 h-px w-6 bg-white/10" aria-hidden="true" />
          <ZoomButton label="Zoom out" onClick={onZoomOut} />
        </div>

        {isDesktopCollapsed ? (
          <button
            type="button"
            aria-expanded={false}
            aria-controls={panelId}
            onClick={() => setIsDesktopCollapsed(false)}
            className={`${desktopGlassCardClass} flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:text-karl-gold motion-reduce:transition-none`}
          >
            <LayersIcon />
            Layers
          </button>
        ) : (
          <div
            id={panelId}
            className={`${desktopGlassCardClass} w-full p-3 shadow-xl`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Map Layers</p>
                <p className="text-xs text-white/55">Customize the Karl map</p>
              </div>
              <button
                type="button"
                aria-label="Collapse layers panel"
                onClick={() => setIsDesktopCollapsed(true)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-sm text-white/65 transition-colors hover:border-white/20 hover:text-white motion-reduce:transition-none"
              >
                ×
              </button>
            </div>
            <LayerPanelContent
              mapStyle={mapStyle}
              fogLayerEnabled={fogLayerEnabled}
              onMapStyleChange={onMapStyleChange}
              onFogLayerChange={onFogLayerChange}
              vertical
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)]">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="map-layer-panel"
        onClick={() => setIsOpen((open) => !open)}
        className="rounded-full border border-white/12 bg-karl-navy/88 px-3 py-2 text-xs font-semibold text-white/80 shadow-lg backdrop-blur-sm transition-colors hover:border-karl-gold/25 hover:text-karl-gold motion-reduce:transition-none"
      >
        Map Layers
      </button>

      {isOpen ? (
        <div
          id="map-layer-panel"
          className="mt-2 w-[min(100%,17rem)] rounded-2xl border border-white/10 bg-karl-navy/92 p-3 shadow-xl backdrop-blur-md"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">Map Layers</p>
            <p className="text-xs text-white/55">Customize the Karl map</p>
          </div>
          <LayerPanelContent
            mapStyle={mapStyle}
            fogLayerEnabled={fogLayerEnabled}
            onMapStyleChange={onMapStyleChange}
            onFogLayerChange={onFogLayerChange}
          />
        </div>
      ) : null}
    </div>
  );
}
