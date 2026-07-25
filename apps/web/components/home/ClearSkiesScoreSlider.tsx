import { MetricPercentSlider } from "@/components/home/MetricPercentSlider";
import { clearSkiesIndicatorAriaLabel } from "@/lib/home/metricPercent";

type ClearSkiesScoreSliderProps = {
  sunshineScore: number;
};

export function ClearSkiesScoreSlider({ sunshineScore }: ClearSkiesScoreSliderProps) {
  return (
    <MetricPercentSlider
      percent={sunshineScore}
      variant="sunshine"
      leftLabel="Poor"
      rightLabel="Excellent"
      ariaLabel={clearSkiesIndicatorAriaLabel(sunshineScore)}
      testId="clear-skies-slider"
    />
  );
}
