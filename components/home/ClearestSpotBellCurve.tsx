import { mobileMetricIndicatorClass } from "@/components/home/desktopGlass";
import {
  CLEAREST_SPOT_BELL_CURVE_BASELINE_Y,
  CLEAREST_SPOT_BELL_CURVE_PEAK_Y,
  CLEAREST_SPOT_BELL_CURVE_VIEWBOX,
  CLEAREST_SPOT_BELL_CURVE_VIEWBOX_BOTTOM_INSET,
  CLEAREST_SPOT_BELL_CURVE_VIEWBOX_TOP_INSET,
  clearestSpotBellCurveAriaLabel,
  clearestSpotBellCurveDisplayViewBox,
  clearestSpotBellCurvePath,
  clearestSpotBellCurveVisualX,
} from "@/lib/home/metricPercent";

type ClearestSpotBellCurveProps = {
  score: number;
};

/** Large bell curve sized to the mockup while staying inside the fixed mobile card */
export const clearestSpotBellCurveFrameClass = "max-sm:h-12 max-sm:w-full";

/** Reclaim detail-line spacing above; pad below so the baseline never touches the card edge */
export const clearestSpotBellCurveContainerClass = `${mobileMetricIndicatorClass} max-sm:shrink-0 max-sm:-mt-2 max-sm:overflow-hidden max-sm:!pt-1 max-sm:pb-1.5`;

export function ClearestSpotBellCurve({ score }: ClearestSpotBellCurveProps) {
  const visualPeakX = clearestSpotBellCurveVisualX(score);
  const curvePath = clearestSpotBellCurvePath(score);
  const displayViewBox = clearestSpotBellCurveDisplayViewBox();
  const clipRectY = -CLEAREST_SPOT_BELL_CURVE_VIEWBOX_TOP_INSET;
  const clipRectHeight =
    CLEAREST_SPOT_BELL_CURVE_VIEWBOX.height +
    CLEAREST_SPOT_BELL_CURVE_VIEWBOX_TOP_INSET +
    CLEAREST_SPOT_BELL_CURVE_VIEWBOX_BOTTOM_INSET;

  return (
    <div
      className={clearestSpotBellCurveContainerClass}
      role="img"
      aria-label={clearestSpotBellCurveAriaLabel(score)}
      data-testid="clearest-spot-bell-curve"
    >
      <div
        className={clearestSpotBellCurveFrameClass}
        data-testid="clearest-spot-bell-curve-frame"
      >
        <svg
          viewBox={displayViewBox}
          preserveAspectRatio="xMidYMax meet"
          className="h-full w-full"
          aria-hidden="true"
          data-testid="clearest-spot-bell-curve-svg"
          data-viewbox-height={CLEAREST_SPOT_BELL_CURVE_VIEWBOX.height}
        >
          <defs>
            <clipPath id="clearest-spot-bell-curve-clip">
              <rect
                x="0"
                y={clipRectY}
                width={CLEAREST_SPOT_BELL_CURVE_VIEWBOX.width}
                height={clipRectHeight}
              />
            </clipPath>
            <filter id="clearest-spot-peak-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g clipPath="url(#clearest-spot-bell-curve-clip)">
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
          </g>
        </svg>
      </div>
    </div>
  );
}
