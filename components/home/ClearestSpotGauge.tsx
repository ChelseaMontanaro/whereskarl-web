import { mobileMetricIndicatorClass } from "@/components/home/desktopGlass";
import {
  CLEAREST_SPOT_GAUGE_CENTER_X,
  CLEAREST_SPOT_GAUGE_CENTER_Y,
  CLEAREST_SPOT_GAUGE_VIEWBOX,
  clearestSpotGaugeActiveArcPath,
  clearestSpotGaugeArcEnd,
  clearestSpotGaugeArcStart,
  clearestSpotGaugeAriaLabel,
  clearestSpotGaugeInactiveArcPath,
  clearestSpotGaugeMarkerPoint,
  clearestSpotGaugeMarkerRotationDegrees,
} from "@/lib/home/clearestSpotGauge";

type ClearestSpotGaugeProps = {
  score: number;
};

export const clearestSpotGaugeFrameClass =
  "max-sm:mx-auto max-sm:h-full max-sm:w-[88%] max-sm:max-w-full max-sm:overflow-hidden";

export const clearestSpotGaugeContainerClass = `${mobileMetricIndicatorClass} max-sm:h-[2.375rem] max-sm:min-h-0 max-sm:w-full max-sm:shrink-0 max-sm:!pt-0 max-sm:pb-0`;

export function ClearestSpotGauge({ score }: ClearestSpotGaugeProps) {
  const marker = clearestSpotGaugeMarkerPoint(score);
  const activeArcPath = clearestSpotGaugeActiveArcPath(score);
  const inactiveArcPath = clearestSpotGaugeInactiveArcPath(score);
  const markerRotation = clearestSpotGaugeMarkerRotationDegrees(score);
  const arcStart = clearestSpotGaugeArcStart();
  const arcEnd = clearestSpotGaugeArcEnd();
  const labelY = CLEAREST_SPOT_GAUGE_VIEWBOX.height - 1.5;

  return (
    <div
      className={clearestSpotGaugeContainerClass}
      role="img"
      aria-label={clearestSpotGaugeAriaLabel(score)}
      data-testid="clearest-spot-gauge"
    >
      <div
        className={clearestSpotGaugeFrameClass}
        data-testid="clearest-spot-gauge-frame"
      >
        <svg
          viewBox={`0 0 ${CLEAREST_SPOT_GAUGE_VIEWBOX.width} ${CLEAREST_SPOT_GAUGE_VIEWBOX.height}`}
          preserveAspectRatio="xMidYMax meet"
          className="h-full w-full"
          aria-hidden="true"
          data-testid="clearest-spot-gauge-svg"
          data-viewbox-width={CLEAREST_SPOT_GAUGE_VIEWBOX.width}
          data-viewbox-height={CLEAREST_SPOT_GAUGE_VIEWBOX.height}
        >
          <g>
            {inactiveArcPath ? (
              <path
                d={inactiveArcPath}
                fill="none"
                stroke="rgba(107, 163, 214, 0.22)"
                strokeWidth="4.5"
                strokeLinecap="round"
                data-testid="clearest-spot-gauge-inactive-arc"
              />
            ) : null}
            {activeArcPath ? (
              <path
                d={activeArcPath}
                fill="none"
                stroke="#6BA3D6"
                strokeWidth="4.5"
                strokeLinecap="round"
                data-testid="clearest-spot-gauge-active-arc"
              />
            ) : null}
            <line
              x1={CLEAREST_SPOT_GAUGE_CENTER_X}
              y1={CLEAREST_SPOT_GAUGE_CENTER_Y}
              x2={marker.x}
              y2={marker.y}
              stroke="white"
              strokeWidth="1.25"
              strokeLinecap="round"
              data-testid="clearest-spot-gauge-needle"
            />
            <circle
              cx={CLEAREST_SPOT_GAUGE_CENTER_X}
              cy={CLEAREST_SPOT_GAUGE_CENTER_Y}
              r="3.25"
              fill="white"
              data-testid="clearest-spot-gauge-hub"
            />
            <circle
              cx={CLEAREST_SPOT_GAUGE_CENTER_X}
              cy={CLEAREST_SPOT_GAUGE_CENTER_Y}
              r="1.35"
              fill="#6BA3D6"
              data-testid="clearest-spot-gauge-hub-dot"
            />
            <rect
              x={marker.x - 3.25}
              y={marker.y - 2}
              width="6.5"
              height="4"
              rx="2"
              fill="white"
              transform={`rotate(${markerRotation} ${marker.x} ${marker.y})`}
              data-testid="clearest-spot-gauge-marker"
              data-marker-x={marker.x}
              data-marker-y={marker.y}
            />
            <text
              x={arcStart.x}
              y={labelY}
              textAnchor="middle"
              fill="rgba(255,255,255,0.42)"
              fontSize="4.25"
              fontWeight="700"
              letterSpacing="0.06em"
              data-testid="clearest-spot-gauge-label-low"
            >
              LOW
            </text>
            <text
              x={arcEnd.x}
              y={labelY}
              textAnchor="middle"
              fill="rgba(255,255,255,0.42)"
              fontSize="4.25"
              fontWeight="700"
              letterSpacing="0.06em"
              data-testid="clearest-spot-gauge-label-best"
            >
              BEST
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
