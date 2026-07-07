import { mobileCardLabelClass, mobileMetricIndicatorClass } from "@/components/home/desktopGlass";
import {
  CLEAREST_SPOT_GAUGE_CENTER_X,
  CLEAREST_SPOT_GAUGE_CENTER_Y,
  CLEAREST_SPOT_GAUGE_VIEWBOX,
  clearestSpotGaugeActiveArcPath,
  clearestSpotGaugeAriaLabel,
  clearestSpotGaugeInactiveArcPath,
  clearestSpotGaugeMarkerPoint,
  clearestSpotGaugeMarkerRotationDegrees,
} from "@/lib/home/clearestSpotGauge";

type ClearestSpotGaugeProps = {
  score: number;
};

export const clearestSpotGaugeFrameClass =
  "max-sm:mx-auto max-sm:h-[3.5rem] max-sm:w-[84%] max-sm:max-w-full max-sm:overflow-hidden";

export const clearestSpotGaugeContainerClass = `${mobileMetricIndicatorClass} max-sm:shrink-0 max-sm:w-full max-sm:pt-1 max-sm:pb-1.5`;

export const clearestSpotGaugeLabelsClass = `mt-1 flex w-[84%] max-sm:mx-auto items-center justify-between`;

export const clearestSpotGaugeLabelClass = `text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/42 ${mobileCardLabelClass}`;

export function ClearestSpotGauge({ score }: ClearestSpotGaugeProps) {
  const marker = clearestSpotGaugeMarkerPoint(score);
  const activeArcPath = clearestSpotGaugeActiveArcPath(score);
  const inactiveArcPath = clearestSpotGaugeInactiveArcPath(score);
  const markerRotation = clearestSpotGaugeMarkerRotationDegrees(score);

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
          </g>
        </svg>
      </div>
      <div
        className={`${clearestSpotGaugeLabelsClass} ${clearestSpotGaugeLabelClass}`}
        aria-hidden="true"
        data-testid="clearest-spot-gauge-labels"
      >
        <span>LOW</span>
        <span>BEST</span>
      </div>
    </div>
  );
}
