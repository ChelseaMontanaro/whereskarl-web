"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  PrimaryNavList,
  SecondaryNavList,
} from "@/components/layout/NavLinks";

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export function DesktopNavDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const drawerId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openDrawer = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    closeDrawer();
  }, [closeDrawer, pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeDrawer, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      menuButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div className="hidden lg:contents">
      <button
        ref={menuButtonRef}
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls={drawerId}
        onClick={openDrawer}
        className="fixed left-4 top-4 z-30 inline-flex items-center justify-center rounded-full border border-white/10 bg-black/45 p-2.5 text-white/85 shadow-lg backdrop-blur-sm transition-colors motion-reduce:transition-none hover:border-karl-gold/30 hover:text-karl-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karl-gold"
      >
        <MenuIcon />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px] motion-reduce:transition-none"
            onClick={closeDrawer}
          />
          <aside
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-karl-navy-soft/95 px-5 py-8 shadow-2xl backdrop-blur-md motion-reduce:transition-none"
          >
            <div className="mb-8 space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-karl-gold">
                Where&apos;s Karl?
              </p>
              <p className="text-sm text-white/60">Track Karl across the Bay</p>
            </div>

            <nav aria-label="Primary" className="flex flex-col gap-1">
              <PrimaryNavList layout="drawer" onNavigate={closeDrawer} />
            </nav>

            <nav
              aria-label="Legal and support"
              className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-6"
            >
              <SecondaryNavList onNavigate={closeDrawer} />
            </nav>
          </aside>
        </>
      ) : null}
    </div>
  );
}
