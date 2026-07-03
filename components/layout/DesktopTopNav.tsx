"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { KarlLogo } from "@/components/brand/KarlLogo";
import { FindClearSkiesCta } from "@/components/home/FindClearSkiesCta";
import { PrimaryNavList } from "@/components/layout/NavLinks";
import { useClearSkiesNav } from "@/components/providers/ClearSkiesNavProvider";

export function DesktopTopNav() {
  const pathname = usePathname();
  const { locationId, isLoading } = useClearSkiesNav();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const headerSurfaceClass = isScrolled || !isHome
    ? "border-b border-white/10 bg-karl-navy/78 backdrop-blur-md"
    : "bg-gradient-to-b from-black/50 via-black/20 to-transparent";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 hidden transition-colors duration-300 motion-reduce:transition-none lg:block ${headerSurfaceClass}`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4 xl:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karl-gold"
        >
          <KarlLogo className="h-10 w-10" />
          <span>
            <span className="block font-serif text-lg font-semibold tracking-[0.02em] text-white/[0.96]">
              Where&apos;s Karl?
            </span>
            <span className="mt-0.5 block text-[0.625rem] font-bold uppercase tracking-[0.24em] text-karl-gold/90">
              Track Karl across the Bay
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="mx-auto flex items-center gap-1.5"
        >
          <PrimaryNavList layout="top" />
        </nav>

        <FindClearSkiesCta
          locationId={locationId}
          isLoading={isLoading}
          variant="header"
          className="shrink-0"
        />
      </div>
    </header>
  );
}
