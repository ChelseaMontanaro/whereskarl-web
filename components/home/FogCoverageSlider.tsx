import { MetricPercentSlider } from "@/components/home/MetricPercentSlider";
import { fogCoverageIndicatorAriaLabel } from "@/lib/home/metricPercent";

type FogCoverageSliderProps = {
  fogCoveragePercent: number;
};

export function FogCoverageSlider({ fogCoveragePercent }: FogCoverageSliderProps) {
  return (
    <MetricPercentSlider
      percent={fogCoveragePercent}
      variant="fog"
      leftLabel="Clear"
      rightLabel="Thick"
      ariaLabel={fogCoverageIndicatorAriaLabel(fogCoveragePercent)}
      testId="fog-coverage-slider"
    />
  );
}
