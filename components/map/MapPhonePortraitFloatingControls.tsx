"use client";

type MapPhonePortraitFloatingControlsProps = {
  onLocateMe?: () => void;
  onResetView?: () => void;
  onOpenLayers?: () => void;
};

export function MapPhonePortraitFloatingControls({
  onLocateMe,
  onResetView,
  onOpenLayers,
}: MapPhonePortraitFloatingControlsProps) {
  const buttonClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/16 bg-[rgb(3_11_20/0.72)] text-lg text-white shadow-[0_3px_8px_rgb(0_0_0/0.22)] transition-opacity hover:opacity-90 motion-reduce:transition-none";

  return (
    <div className="flex flex-col items-center gap-2.5">
      {onOpenLayers ? (
        <button
          type="button"
          aria-label="Open map layers"
          onClick={onOpenLayers}
          className={buttonClass}
        >
          ☰
        </button>
      ) : null}

      {onLocateMe ? (
        <button
          type="button"
          aria-label="Locate me"
          onClick={onLocateMe}
          className={buttonClass}
        >
          ⌖
        </button>
      ) : null}

      {onResetView ? (
        <button
          type="button"
          aria-label="Reset map view"
          onClick={onResetView}
          className={buttonClass}
        >
          ◎
        </button>
      ) : null}
    </div>
  );
}
