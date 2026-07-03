"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ConditionsPresentation } from "@/lib/home/conditionsStatus";

type ConditionsStatusContextValue = {
  presentation: ConditionsPresentation;
  setPresentation: (presentation: ConditionsPresentation) => void;
};

const ConditionsStatusContext = createContext<ConditionsStatusContextValue>({
  presentation: "loading",
  setPresentation: () => {},
});

export function ConditionsStatusProvider({ children }: { children: ReactNode }) {
  const [presentation, setPresentation] =
    useState<ConditionsPresentation>("loading");

  const value = useMemo(
    () => ({ presentation, setPresentation }),
    [presentation],
  );

  return (
    <ConditionsStatusContext.Provider value={value}>
      {children}
    </ConditionsStatusContext.Provider>
  );
}

export function useConditionsStatus() {
  return useContext(ConditionsStatusContext);
}
