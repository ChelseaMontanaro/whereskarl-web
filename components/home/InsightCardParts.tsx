import type { ReactNode } from "react";

import { ChevronRightIcon } from "@/components/home/ConditionIcons";
import {
  desktopGoldIconClass,
  desktopMistIconClass,
} from "@/components/home/desktopGlass";

export function CardLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/38 lg:text-[0.68rem] lg:font-bold lg:tracking-[0.16em] lg:text-karl-gold/85 ${className}`}
    >
      {children}
    </p>
  );
}

export function SunshineScoreBadge({ score }: { score: number }) {
  return (
    <div className="shrink-0 rounded-full border border-karl-gold/32 bg-karl-gold/10 px-3 py-2 text-center lg:min-w-[4.75rem] lg:px-3.5">
      <p className="text-2xl font-light leading-none text-karl-gold lg:text-[1.85rem]">
        {score}
      </p>
      <p className="mt-0.5 text-[0.625rem] uppercase tracking-[0.12em] text-white/50">
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
  const toneClass = tone === "gold" ? desktopGoldIconClass : desktopMistIconClass;

  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border lg:h-16 lg:w-16 ${toneClass}`}
    >
      {children}
    </div>
  );
}

export function InsightCardChevron() {
  return (
    <ChevronRightIcon className="h-5 w-5 shrink-0 text-white/45 lg:h-6 lg:w-6" />
  );
}
