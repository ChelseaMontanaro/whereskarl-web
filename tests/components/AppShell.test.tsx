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

  it("renders mobile bottom navigation with the four primary tabs", () => {
    renderShell("/");

    const bottomNav = screen.getAllByRole("navigation", { name: "Primary" })[1];
    for (const label of ["Home", "Map", "Favorites", "Settings"]) {
      expect(within(bottomNav).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("uses glass styling and safe-area padding on the mobile bottom nav", () => {
    renderShell("/");

    const bottomNav = screen.getAllByRole("navigation", { name: "Primary" })[1];
    const navInner = bottomNav.firstElementChild as HTMLElement;

    expect(bottomNav.className).toContain("bg-black/40");
    expect(bottomNav.className).toContain("backdrop-blur-lg");
    expect(navInner.className).toContain("safe-area-inset-bottom");
  });

  it("renders the desktop top navigation with primary links and Find Clear Skies", () => {
    renderShell("/");

    const topNav = screen.getAllByRole("navigation", { name: "Primary" })[0];
    expect(within(topNav).getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(within(topNav).getByRole("link", { name: "Map" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find Clear Skies" })).toBeInTheDocument();
    expect(screen.getByText("Where's Karl?").closest("a")?.querySelector("img")).toBeTruthy();
  });

  it("highlights the active primary route in the desktop top navigation", () => {
    renderShell("/favorites");

    const topNav = screen.getAllByRole("navigation", { name: "Primary" })[0];
    expect(within(topNav).getByRole("link", { name: "Favorites" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(topNav).getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders Privacy and Support links in the mobile footer", () => {
    renderShell("/");

    const legalNav = screen.getByRole("navigation", { name: "Legal and support" });
    expect(within(legalNav).getByRole("link", { name: "Privacy" })).toBeInTheDocument();
    expect(within(legalNav).getByRole("link", { name: "Support" })).toBeInTheDocument();
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
