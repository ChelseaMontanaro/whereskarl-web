import type { ReactNode } from "react";

import { ChevronRightIcon } from "@/components/home/ConditionIcons";

export function CardLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/38 lg:text-[0.68rem] lg:tracking-[0.16em] lg:text-karl-gold/75 ${className}`}
    >
      {children}
    </p>
  );
}

export function SunshineScoreBadge({ score }: { score: number }) {
  return (
    <div className="shrink-0 rounded-full border border-karl-gold/30 bg-karl-gold/10 px-3 py-2 text-center">
      <p className="text-2xl font-light leading-none text-karl-gold">{score}</p>
      <p className="mt-0.5 text-[0.625rem] uppercase tracking-[0.12em] text-white/45">
        Sunshine
      </p>
    </div>
  );
}

export function InsightIconFrame({
  children,
  tone = "mist",
}: {
  children: ReactNode;
  tone?: "mist" | "gold";
}) {
  const toneClass =
    tone === "gold"
      ? "border-karl-gold/25 bg-karl-gold/8 text-karl-gold"
      : "border-sky-200/15 bg-sky-100/6 text-sky-100/85";

  return (
    <div
      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border ${toneClass} lg:h-[4.5rem] lg:w-[4.5rem]`}
    >
      {children}
    </div>
  );
}

export function InsightCardChevron() {
  return (
    <ChevronRightIcon className="h-5 w-5 shrink-0 text-white/35 lg:h-6 lg:w-6" />
  );
}
