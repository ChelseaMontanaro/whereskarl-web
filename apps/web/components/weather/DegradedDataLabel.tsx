import {
  DEGRADED_BEST_RIGHT_NOW_LABEL,
  DEGRADED_LOCATION_STATUS_LABEL,
} from "@/lib/weather/dataStatus";

type DegradedDataLabelProps = {
  variant?: "location" | "bestRightNow";
  className?: string;
};

const variantLabels = {
  location: DEGRADED_LOCATION_STATUS_LABEL,
  bestRightNow: DEGRADED_BEST_RIGHT_NOW_LABEL,
} as const;

export function DegradedDataLabel({
  variant = "location",
  className,
}: DegradedDataLabelProps) {
  const defaultClassName =
    variant === "bestRightNow"
      ? "text-[0.625rem] font-medium text-white/42"
      : "text-[0.625rem] font-medium text-white/42";

  return (
    <p className={className ?? defaultClassName}>{variantLabels[variant]}</p>
  );
}
