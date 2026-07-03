import Link from "next/link";

import { buildMapHref } from "@/lib/map/routing";

type FindClearSkiesCtaProps = {
  locationId: string | null;
  isLoading: boolean;
  variant?: "primary" | "secondary";
  className?: string;
};

function PrimaryCtaLabel({ isLoading }: { isLoading: boolean }) {
  return isLoading ? "Finding clear skies…" : "Find Clear Skies";
}

export function FindClearSkiesCta({
  locationId,
  isLoading,
  variant = "primary",
  className = "",
}: FindClearSkiesCtaProps) {
  const href = buildMapHref(locationId);
  const label =
    variant === "secondary" ? "View brightest spot on map" : undefined;

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        aria-busy={isLoading}
        aria-disabled={isLoading}
        className={`inline-flex min-h-10 items-center rounded-full border border-karl-gold/35 bg-karl-gold/12 px-4 text-sm font-semibold text-karl-gold transition-colors hover:bg-karl-gold/18 motion-reduce:transition-none ${
          isLoading ? "pointer-events-none opacity-60" : ""
        } ${className}`}
      >
        {isLoading ? "Finding clear skies…" : label}
      </Link>
    );
  }

  if (isLoading) {
    return (
      <span
        aria-busy="true"
        className={`inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full border border-karl-gold/25 bg-karl-gold/20 px-5 text-sm font-bold uppercase tracking-[0.12em] text-karl-gold-deep/80 ${className}`}
      >
        <PrimaryCtaLabel isLoading />
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full bg-gradient-to-b from-[rgb(255_196_71)] via-karl-gold to-karl-gold-deep px-5 text-sm font-bold uppercase tracking-[0.12em] text-[rgb(46_31_10)] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-opacity hover:opacity-95 motion-reduce:transition-none ${className}`}
      aria-label="Find Clear Skies"
    >
      <PrimaryCtaLabel isLoading={false} />
    </Link>
  );
}

export function findClearSkiesAccessibilityHint(locationId: string | null): string {
  if (locationId) {
    return `Opens the map focused on ${locationId.replaceAll("-", " ")}`;
  }

  return "Opens the Bay Area map";
}
