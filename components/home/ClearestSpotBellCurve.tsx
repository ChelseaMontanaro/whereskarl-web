import {
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
      className="mt-2.5 hidden w-full max-sm:block"
      role="img"
      aria-label={clearestSpotBellCurveAriaLabel(score)}
      data-testid="clearest-spot-bell-curve"
    >
      <svg
        viewBox="0 0 100 24"
        className="h-6 w-full"
        aria-hidden="true"
        data-testid="clearest-spot-bell-curve-svg"
      >
        <defs>
          <filter id="clearest-spot-peak-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1="0"
          y1="20"
          x2="100"
          y2="20"
          stroke="white"
          strokeOpacity="0.18"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d={curvePath}
          fill="none"
          stroke="#6BA3D6"
          strokeWidth="1.5"
          strokeLinecap="round"
          data-testid="clearest-spot-bell-curve-path"
        />
        <circle
          cx={peakX}
          cy={peakY}
          r="2.6"
          fill="white"
          filter="url(#clearest-spot-peak-glow)"
          data-testid="clearest-spot-bell-curve-peak"
        />
      </svg>
    </div>
  );
}
