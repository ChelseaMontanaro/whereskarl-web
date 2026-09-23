import Link from "next/link";

import { KarlLogo } from "@/components/brand/KarlLogo";

const FOOTER_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/support", label: "Support" },
] as const;

export function MarketingFooter({ lockup = "default" }: { lockup?: "default" | "landing" }) {
  const landing = lockup === "landing";

  return (
    <footer className="border-t border-[#d5e0ec] bg-white">
      <div
        className={`mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-x-8 gap-y-6 px-5 sm:px-8 max-lg:items-start lg:items-center lg:gap-y-4 ${
          landing ? "py-6 lg:py-4" : "py-6"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d4f91]"
        >
          <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-[#16325c] ${
              landing ? "h-11 w-11" : "h-9 w-9"
            }`}
          >
            <KarlLogo className={landing ? "h-8 w-8" : "h-6 w-6"} size={landing ? 96 : 32} />
          </span>
          <span>
            <span
              className={`block font-serif font-semibold text-[#16325c] ${
                landing ? "text-lg" : "text-base"
              }`}
            >
              Where&apos;s Karl
            </span>
            <span className="mt-0.5 block text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[#4d627c]">
              Bay Area fog forecasts
            </span>
          </span>
        </Link>

        <nav aria-label="Footer" className="w-full lg:w-auto">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm text-sm font-medium text-[#16325c] hover:text-[#1d4f91] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d4f91]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="w-full text-sm text-[#4d627c] lg:w-auto">
          © {new Date().getFullYear()} Where&apos;s Karl. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
