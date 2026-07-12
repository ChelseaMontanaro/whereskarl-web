"use client";

import { useEffect, useState } from "react";

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
  onImmersivePanelOpenChange?: (isOpen: boolean) => void;
};

function ZoomButton({
  label,
  onClick,
  compact = false,
}: {
  label: string;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl font-light text-white/80 transition-colors hover:bg-white/[0.06] hover:text-karl-gold motion-reduce:transition-none ${
        compact ? "h-8 w-8 text-base" : "h-9 w-9 text-lg"
      }`}
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

function FogLayerToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-karl-navy-glass/70 px-3 py-2.5">
      <span id="fog-layer-label" className="text-sm text-white/80">
        Fog Layer
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby="fog-layer-label"
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karl-gold/50 ${
          enabled
            ? "border-karl-gold/35 bg-karl-gold/30"
            : "border-white/15 bg-white/10"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
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
        <FogLayerToggle
          enabled={fogLayerEnabled}
          onChange={onFogLayerChange}
        />
      </section>
    </div>
  );
}

function DesktopMapLayerControls({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  onZoomIn,
  onZoomOut,
}: Omit<MapLayerControlsProps, "layout">) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <div className="absolute right-5 top-[5.5rem] z-10 flex w-[min(100%,17rem)] flex-col items-end gap-2">
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
          aria-controls="map-layer-panel-desktop"
          onClick={() => setIsDesktopCollapsed(false)}
          className={`${desktopGlassCardClass} flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:text-karl-gold motion-reduce:transition-none`}
        >
          <LayersIcon />
          Layers
        </button>
      ) : (
        <div
          id="map-layer-panel-desktop"
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

// Tablet immersive controls only. The phone-portrait Fog Layer trigger is the
// canonical `MapPhonePortraitLayersControl` below, positioned by MapView inside
// the shared phone-portrait control group above the Fog Intensity rail.
function ImmersiveMapLayerControls({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  onZoomIn,
  onZoomOut,
  onImmersivePanelOpenChange,
}: Omit<MapLayerControlsProps, "layout">) {
  const [isLayersCollapsed, setIsLayersCollapsed] = useState(false);

  useEffect(() => {
    onImmersivePanelOpenChange?.(!isLayersCollapsed);
  }, [isLayersCollapsed, onImmersivePanelOpenChange]);

  const openLayersPanel = () => setIsLayersCollapsed(false);
  const closeLayersPanel = () => setIsLayersCollapsed(true);

  return (
    <div className="absolute right-3 top-3 z-20 flex w-[min(17rem,calc(100%-0.75rem))] max-w-full flex-col items-stretch gap-1.5 sm:top-4 sm:gap-2 md:top-[4.5rem]">
      <div
        className={`${desktopGlassCardClass} flex flex-col items-center p-0.5 sm:p-1`}
        aria-label="Map zoom controls"
      >
        <ZoomButton label="Zoom in" onClick={onZoomIn} />
        <div className="my-0.5 h-px w-5 bg-white/10 sm:w-6" aria-hidden="true" />
        <ZoomButton label="Zoom out" onClick={onZoomOut} />
      </div>

      {isLayersCollapsed ? (
        <button
          type="button"
          aria-expanded={false}
          aria-controls="map-layer-panel-immersive"
          aria-label="Open map layers"
          onClick={openLayersPanel}
          className={`${desktopGlassCardClass} flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-white/80 transition-colors hover:text-karl-gold motion-reduce:transition-none sm:px-3`}
        >
          <LayersIcon className="h-4 w-4" />
          <span>Layers</span>
        </button>
      ) : (
        <div
          id="map-layer-panel-immersive"
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
              onClick={closeLayersPanel}
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

type MapPhonePortraitLayersControlProps = Pick<
  MapLayerControlsProps,
  "mapStyle" | "fogLayerEnabled" | "onMapStyleChange" | "onFogLayerChange"
> & {
  onOpenChange?: (isOpen: boolean) => void;
};

/**
 * Canonical phone-portrait Fog Layer menu trigger. Renders the same glass
 * hamburger button + layers panel used everywhere else, but inline so the
 * shared phone-portrait control group in MapView can position it directly above
 * the Fog Intensity rail. The trigger stays mounted while the panel is open so
 * the menu (a fixed backdrop + anchored panel) can toggle and stay reachable.
 */
export function MapPhonePortraitLayersControl({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  onOpenChange,
}: MapPhonePortraitLayersControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close map layers"
          className="fixed inset-0 z-[15] bg-black/42 backdrop-blur-[1px] motion-reduce:transition-none"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <div className="relative z-30 flex flex-col">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="map-layer-panel-phone"
          aria-label="Open map layers"
          onClick={() => setIsOpen((open) => !open)}
          className={`${desktopGlassCardClass} flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-white/80 transition-colors hover:text-karl-gold motion-reduce:transition-none sm:px-3`}
        >
          <LayersIcon className="h-3.5 w-3.5" />
          <span className="sr-only">Layers</span>
        </button>

        {isOpen ? (
          <div
            id="map-layer-panel-phone"
            className={`${desktopGlassCardClass} absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[min(calc(100vw-1.5rem),17rem)] p-3 shadow-xl`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Map Layers</p>
                <p className="text-xs text-white/55">Customize the Karl map</p>
              </div>
              <button
                type="button"
                aria-label="Collapse layers panel"
                onClick={() => setIsOpen(false)}
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
        ) : null}
      </div>
    </>
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
  onImmersivePanelOpenChange,
}: MapLayerControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (layout === "desktop") {
    return (
      <DesktopMapLayerControls
        mapStyle={mapStyle}
        fogLayerEnabled={fogLayerEnabled}
        onMapStyleChange={onMapStyleChange}
        onFogLayerChange={onFogLayerChange}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />
    );
  }

  if (layout === "immersive") {
    return (
      <ImmersiveMapLayerControls
        mapStyle={mapStyle}
        fogLayerEnabled={fogLayerEnabled}
        onMapStyleChange={onMapStyleChange}
        onFogLayerChange={onFogLayerChange}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onImmersivePanelOpenChange={onImmersivePanelOpenChange}
      />
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
