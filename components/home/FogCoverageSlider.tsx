import {
  fogCoverageIndicatorAriaLabel,
  fogCoverageSliderFillWidth,
} from "@/lib/home/fogCoverageIndicator";

type FogCoverageSliderProps = {
  fogCoveragePercent: number;
};

export function FogCoverageSlider({ fogCoveragePercent }: FogCoverageSliderProps) {
  const fillWidth = fogCoverageSliderFillWidth(fogCoveragePercent);

  return (
    <div
      className="mt-2.5 hidden w-full max-sm:block"
      role="img"
      aria-label={fogCoverageIndicatorAriaLabel(fogCoveragePercent)}
      data-testid="fog-coverage-slider"
    >
      <div
        className="relative h-[5px] w-full"
        aria-hidden="true"
        data-testid="fog-coverage-slider-track"
      >
        <div className="absolute inset-0 rounded-full bg-white/22" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-karl-navy"
          data-testid="fog-coverage-slider-fill"
          style={{ width: fillWidth }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-karl-navy bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
          data-testid="fog-coverage-slider-knob"
          style={{ left: fillWidth }}
        />
      </div>
      <div
        className="mt-2 flex w-full items-center justify-between text-[0.625rem] font-medium tracking-[0.02em] text-white/42"
        aria-hidden="true"
        data-testid="fog-coverage-slider-labels"
      >
        <span>Clear</span>
        <span>Thick</span>
      </div>
    </div>
  );
}
