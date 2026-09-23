"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { KarlLogo } from "@/components/brand/KarlLogo";
import { AppStoreBadge } from "@/components/site/AppStoreBadge";

const NAV_ITEMS = [
  { href: "/#about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/support", label: "Support" },
] as const;

export function MarketingHeader({ tone = "solid" }: { tone?: "solid" | "overlay" }) {
  const pathname = usePathname();
  const overlay = tone === "overlay";

  return (
    <header className={overlay ? "bg-transparent" : "border-b border-[#d5e0ec] bg-white"}>
      <div
        className={`mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-5 px-5 py-5 sm:px-8 lg:gap-y-4 ${
          overlay ? "lg:py-3" : "lg:py-4"
        }`}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d4f91]"
        >
          <span
            className={`flex shrink-0 items-center justify-center rounded-full ${
              overlay
                ? "h-11 w-11 drop-shadow-[0_2px_3px_rgba(12,24,40,0.28)]"
                : "h-10 w-10 bg-[#16325c]"
            }`}
          >
            <KarlLogo className={overlay ? "h-10 w-10" : "h-7 w-7"} size={overlay ? 128 : 32} />
          </span>
          <span className="min-w-0">
            <span
              className={`block font-serif font-semibold tracking-tight text-[#16325c] ${
                overlay ? "text-[1.25rem] leading-none" : "text-lg"
              }`}
            >
              Where&apos;s Karl
            </span>
            <span
              className={`block font-semibold uppercase tracking-[0.16em] ${
                overlay
                  ? "mt-1 text-[0.625rem] text-white"
                  : "mt-0.5 text-[0.625rem] text-[#4d627c]"
              }`}
            >
              Bay Area fog forecasts
            </span>
          </span>
        </Link>

        <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 lg:w-auto lg:justify-start">
          <nav aria-label="Site">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {NAV_ITEMS.map((item) => {
                const current = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={`rounded-sm text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d4f91] ${
                        current
                          ? "text-[#1d4f91]"
                          : "text-[#16325c] hover:text-[#1d4f91]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <AppStoreBadge />
        </div>
      </div>
    </header>
  );
}
