import { metricPercentFillWidth } from "@/lib/home/metricPercent";

export type MetricPercentSliderVariant = "fog" | "sunshine";

type MetricPercentSliderProps = {
  percent: number;
  variant: MetricPercentSliderVariant;
  leftLabel: string;
  rightLabel: string;
  ariaLabel: string;
  testId: string;
};

const variantStyles: Record<
  MetricPercentSliderVariant,
  { fillClass: string; knobBorderClass: string }
> = {
  fog: {
    fillClass: "bg-karl-navy",
    knobBorderClass: "border-karl-navy",
  },
  sunshine: {
    fillClass: "bg-karl-gold",
    knobBorderClass: "border-karl-gold",
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
  const fillWidth = metricPercentFillWidth(percent);
  const styles = variantStyles[variant];

  return (
    <div
      className="mt-2.5 hidden w-full max-sm:block"
      role="img"
      aria-label={ariaLabel}
      data-testid={testId}
    >
      <div
        className="relative h-[5px] w-full"
        aria-hidden="true"
        data-testid={`${testId}-track`}
      >
        <div className="absolute inset-0 rounded-full bg-white/22" />
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${styles.fillClass}`}
          data-testid={`${testId}-fill`}
          style={{ width: fillWidth }}
        />
        <div
          className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)] ${styles.knobBorderClass}`}
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
