import {
  clampMetricPercent,
  metricPercentFillWidth,
} from "@/lib/home/metricPercent";
import {
  mobileMetricIndicatorClass,
  mobileMetricSliderTrackClass,
} from "@/components/home/desktopGlass";

export type MetricPercentSliderVariant = "fog" | "sunshine";

type MetricPercentSliderProps = {
  percent: number;
  variant: MetricPercentSliderVariant;
  leftLabel: string;
  rightLabel: string;
  ariaLabel: string;
  testId: string;
};

const variantColors: Record<MetricPercentSliderVariant, { fill: string; knob: string }> = {
  fog: {
    fill: "rgb(3 11 20)",
    knob: "border-karl-navy",
  },
  sunshine: {
    fill: "rgb(242 163 38)",
    knob: "border-karl-gold",
  },
};

export function MetricPercentSlider({
  percent,
  variant,
  leftLabel,
  rightLabel,
  ariaLabel,
  testId,
}: MetricPercentSliderProps) {
  const clampedPercent = clampMetricPercent(percent);
  const fillWidth = metricPercentFillWidth(clampedPercent);
  const colors = variantColors[variant];

  return (
    <div
      className={mobileMetricIndicatorClass}
      role="img"
      aria-label={ariaLabel}
      data-testid={testId}
    >
      <div
        className={mobileMetricSliderTrackClass}
        aria-hidden="true"
        data-testid={`${testId}-track`}
        data-fill-percent={clampedPercent}
        style={{
          background: `linear-gradient(to right, ${colors.fill} 0%, ${colors.fill} ${fillWidth}, rgba(255,255,255,0.22) ${fillWidth}, rgba(255,255,255,0.22) 100%)`,
        }}
      >
        <div
          className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)] ${colors.knob}`}
          data-testid={`${testId}-knob`}
          style={{ left: fillWidth }}
        />
      </div>
      <div
        className="mt-2 flex w-full items-center justify-between text-[0.625rem] font-medium tracking-[0.02em] text-white/42"
        aria-hidden="true"
        data-testid={`${testId}-labels`}
      >
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
