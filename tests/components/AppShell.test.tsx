// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/AppShell";

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => createElement("a", { href, ...props }, children),
}));

function renderShell(pathname = "/map") {
  usePathnameMock.mockReturnValue(pathname);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(AppShell, null, createElement("div", null, "Placeholder content")),
    ),
  );
}

describe("AppShell", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network unavailable in tests")),
    );
  });

  it("renders the four primary product tabs", () => {
    renderShell("/");

    const primaryNavs = screen.getAllByRole("navigation", { name: "Primary" });
    expect(primaryNavs).toHaveLength(2);

    for (const label of ["Home", "Map", "Favorites", "Settings"]) {
      expect(screen.getAllByRole("link", { name: label })).not.toHaveLength(0);
    }
  });

  it("highlights the active primary route", () => {
    renderShell("/favorites");

    const favoritesLinks = screen.getAllByRole("link", { name: "Favorites" });
    for (const link of favoritesLinks) {
      expect(link).toHaveAttribute("aria-current", "page");
    }

    const homeLinks = screen.getAllByRole("link", { name: "Home" });
    for (const link of homeLinks) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("renders Privacy and Support links outside the tab bar", () => {
    renderShell("/");

    expect(screen.getAllByRole("link", { name: "Privacy" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Support" }).length).toBeGreaterThan(0);
  });

  it("renders placeholder content and conditions footer without API data", () => {
    renderShell("/");

    expect(screen.getByText("Placeholder content")).toBeInTheDocument();
    expect(screen.getByLabelText("Conditions status")).toHaveTextContent(
      "Checking conditions",
    );

    const developerStatus = screen.getByLabelText("Developer status");
    expect(
      within(developerStatus).getByText("Developer status"),
    ).toBeInTheDocument();
  });
});
