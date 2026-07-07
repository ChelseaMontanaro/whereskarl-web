import { mobileMetricIndicatorClass } from "@/components/home/desktopGlass";
import {
  CLEAREST_SPOT_BELL_CURVE_BASELINE_Y,
  CLEAREST_SPOT_BELL_CURVE_VIEWBOX,
  clearestSpotBellCurveAriaLabel,
  clearestSpotBellCurvePath,
  clearestSpotBellCurvePeakY,
  clampMetricPercent,
} from "@/lib/home/metricPercent";

type ClearestSpotBellCurveProps = {
  score: number;
};

export function ClearestSpotBellCurve({ score }: ClearestSpotBellCurveProps) {
  const peakX = clampMetricPercent(score);
  const peakY = clearestSpotBellCurvePeakY(peakX);
  const curvePath = clearestSpotBellCurvePath(peakX);

  return (
    <div
      className={`${mobileMetricIndicatorClass} max-sm:flex max-sm:min-h-[3.25rem] max-sm:items-end max-sm:justify-center`}
      role="img"
      aria-label={clearestSpotBellCurveAriaLabel(score)}
      data-testid="clearest-spot-bell-curve"
    >
      <svg
        viewBox={`0 0 ${CLEAREST_SPOT_BELL_CURVE_VIEWBOX.width} ${CLEAREST_SPOT_BELL_CURVE_VIEWBOX.height}`}
        className="h-11 w-full"
        aria-hidden="true"
        data-testid="clearest-spot-bell-curve-svg"
        data-viewbox-height={CLEAREST_SPOT_BELL_CURVE_VIEWBOX.height}
      >
        <defs>
          <filter id="clearest-spot-peak-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1="0"
          y1={CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}
          x2="100"
          y2={CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}
          stroke="white"
          strokeOpacity="0.18"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d={curvePath}
          fill="none"
          stroke="#6BA3D6"
          strokeWidth="2"
          strokeLinecap="round"
          data-testid="clearest-spot-bell-curve-path"
        />
        <circle
          cx={peakX}
          cy={peakY}
          r="3.2"
          fill="white"
          filter="url(#clearest-spot-peak-glow)"
          data-testid="clearest-spot-bell-curve-peak"
        />
      </svg>
    </div>
  );
}
