import type { ReactNode } from "react";

import { MarketingFooter } from "@/components/site/MarketingFooter";
import { MarketingHeader } from "@/components/site/MarketingHeader";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f8fb] text-[#16325c]">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
