import type { ReactNode } from "react";

import { mobileCardLabelClass, mobileMetricTwoLineLabelClass } from "@/components/home/desktopGlass";

const metricLabelClass = `text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/38 ${mobileCardLabelClass} ${mobileMetricTwoLineLabelClass} lg:text-[0.68rem] lg:tracking-[0.16em] lg:text-karl-gold/82`;

export function MetricCardLabel({ children }: { children: ReactNode }) {
  return <div className={metricLabelClass}>{children}</div>;
}

export function TwoLineMetricLabel({
  lineOne,
  lineTwo,
  desktopText,
}: {
  lineOne: string;
  lineTwo: string;
  desktopText: string;
}) {
  return (
    <>
      <span className="max-sm:hidden">{desktopText}</span>
      <span className="hidden max-sm:block" data-testid="two-line-metric-label">
        <span className="block">{lineOne}</span>
        <span className="block">{lineTwo}</span>
      </span>
    </>
  );
}
