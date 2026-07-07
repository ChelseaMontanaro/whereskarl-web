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

export const CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX = {
  width: CLEAREST_SPOT_GAUGE_VIEWBOX.width,
  height: 62,
} as const;

export const clearestSpotGaugeFrameClass =
  "max-sm:h-[3.375rem] max-sm:w-full max-sm:shrink-0 max-sm:overflow-hidden";

export const clearestSpotGaugeContainerClass = `${mobileMetricIndicatorClass} flex max-sm:min-h-0 max-sm:flex-1 max-sm:flex-col max-sm:justify-end max-sm:w-full max-sm:!pt-0 max-sm:pb-0`;

const CLEAREST_SPOT_GAUGE_LABEL_Y = CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX.height - 2.5;

export function ClearestSpotGauge({ score }: ClearestSpotGaugeProps) {
  const marker = clearestSpotGaugeMarkerPoint(score);
  const activeArcPath = clearestSpotGaugeActiveArcPath(score);
  const inactiveArcPath = clearestSpotGaugeInactiveArcPath(score);
  const markerRotation = clearestSpotGaugeMarkerRotationDegrees(score);
  const arcStart = clearestSpotGaugeArcStart();
  const arcEnd = clearestSpotGaugeArcEnd();

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
          viewBox={`0 0 ${CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX.width} ${CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX.height}`}
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full"
          aria-hidden="true"
          data-testid="clearest-spot-gauge-svg"
          data-viewbox-width={CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX.width}
          data-viewbox-height={CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX.height}
        >
          <defs>
            <linearGradient
              id="clearest-spot-gauge-active-gradient"
              gradientUnits="userSpaceOnUse"
              x1={arcStart.x}
              y1={CLEAREST_SPOT_GAUGE_CENTER_Y}
              x2={arcEnd.x}
              y2={CLEAREST_SPOT_GAUGE_CENTER_Y - CLEAREST_SPOT_GAUGE_VIEWBOX.height * 0.45}
            >
              <stop offset="0%" stopColor="#4A86B5" />
              <stop offset="100%" stopColor="#9AD4FF" />
            </linearGradient>
          </defs>
          <g>
            {inactiveArcPath ? (
              <path
                d={inactiveArcPath}
                fill="none"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="5"
                strokeLinecap="round"
                data-testid="clearest-spot-gauge-inactive-arc"
              />
            ) : null}
            {activeArcPath ? (
              <path
                d={activeArcPath}
                fill="none"
                stroke="url(#clearest-spot-gauge-active-gradient)"
                strokeWidth="5"
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
              fill="#8EC8F0"
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
              y={CLEAREST_SPOT_GAUGE_LABEL_Y}
              textAnchor="middle"
              fill="rgba(255,255,255,0.42)"
              fontSize="4.5"
              fontWeight="700"
              letterSpacing="0.08em"
              data-testid="clearest-spot-gauge-label-low"
            >
              LOW
            </text>
            <text
              x={arcEnd.x}
              y={CLEAREST_SPOT_GAUGE_LABEL_Y}
              textAnchor="middle"
              fill="rgba(255,255,255,0.42)"
              fontSize="4.5"
              fontWeight="700"
              letterSpacing="0.08em"
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
