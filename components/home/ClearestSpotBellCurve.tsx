import { mobileMetricIndicatorClass } from "@/components/home/desktopGlass";
import {
  CLEAREST_SPOT_BELL_CURVE_BASELINE_Y,
  CLEAREST_SPOT_BELL_CURVE_PEAK_Y,
  CLEAREST_SPOT_BELL_CURVE_VIEWBOX,
  clearestSpotBellCurveAriaLabel,
  clearestSpotBellCurvePath,
  clearestSpotBellCurveVisualX,
} from "@/lib/home/metricPercent";

type ClearestSpotBellCurveProps = {
  score: number;
};

export function ClearestSpotBellCurve({ score }: ClearestSpotBellCurveProps) {
  const visualPeakX = clearestSpotBellCurveVisualX(score);
  const curvePath = clearestSpotBellCurvePath(score);

  return (
    <div
      className={`${mobileMetricIndicatorClass} max-sm:flex max-sm:min-h-[4rem] max-sm:items-end max-sm:justify-center`}
      role="img"
      aria-label={clearestSpotBellCurveAriaLabel(score)}
      data-testid="clearest-spot-bell-curve"
    >
      <svg
        viewBox={`0 0 ${CLEAREST_SPOT_BELL_CURVE_VIEWBOX.width} ${CLEAREST_SPOT_BELL_CURVE_VIEWBOX.height}`}
        className="h-16 w-full"
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
          x2={CLEAREST_SPOT_BELL_CURVE_VIEWBOX.width}
          y2={CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}
          stroke="#6BA3D6"
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeLinecap="round"
          data-testid="clearest-spot-bell-curve-baseline"
        />
        <path
          d={curvePath}
          fill="none"
          stroke="#6BA3D6"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          data-testid="clearest-spot-bell-curve-path"
        />
        <circle
          cx={visualPeakX}
          cy={CLEAREST_SPOT_BELL_CURVE_PEAK_Y}
          r="4"
          fill="white"
          filter="url(#clearest-spot-peak-glow)"
          data-testid="clearest-spot-bell-curve-peak"
          data-visual-peak-x={visualPeakX}
        />
      </svg>
    </div>
  );
}
