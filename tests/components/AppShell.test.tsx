// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/AppShell";

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
}));

const usePhonePortraitMock = vi.hoisted(() => vi.fn(() => false));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("@/lib/hooks/usePhonePortrait", () => ({
  usePhonePortrait: () => usePhonePortraitMock(),
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
    usePhonePortraitMock.mockReturnValue(false);
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

  it("uses glass styling and canonical bottom safe-area padding on the mobile bottom nav", () => {
    renderShell("/");

    const bottomNav = screen.getAllByRole("navigation", { name: "Primary" })[1];
    const navInner = bottomNav.firstElementChild as HTMLElement;

    expect(bottomNav.className).toContain("bg-black/40");
    expect(bottomNav.className).toContain("backdrop-blur-lg");
    expect(bottomNav.className).toContain("fixed");
    expect(bottomNav.className).toContain("bottom-0");
    expect(navInner.className).toContain(
      "pb-[max(env(safe-area-inset-bottom,0px),0.5rem)]",
    );
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

  it("trims phone portrait Home scroll chrome to nav clearance only", () => {
    usePhonePortraitMock.mockReturnValue(true);
    renderShell("/");

    const main = screen.getByText("Placeholder content").closest("main");
    expect(main?.className).toContain(
      "pb-[calc(4.25rem+env(safe-area-inset-bottom,0.5rem))]",
    );
    expect(main?.className).not.toContain("pb-24");
    expect(main?.className).not.toContain("flex-1");
    expect(screen.getByText("Placeholder content").closest("div.min-h-screen")).toBeNull();
    expect(screen.queryByLabelText("Conditions status")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Legal and support" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Developer status")).not.toBeInTheDocument();
  });

  it("keeps phone portrait Map on min-h-screen without in-flow footers that grow the document", () => {
    usePhonePortraitMock.mockReturnValue(true);
    renderShell("/map");

    const main = screen.getByText("Placeholder content").closest("main");
    // Keep full-viewport shell height (top search). Do not add pb-24 / footers
    // that make the document taller than the viewport and clip fixed chrome.
    expect(main?.className).toContain("flex-1");
    expect(main?.className).not.toContain("pb-24");
    expect(screen.getByText("Placeholder content").closest("div.min-h-screen")).toBeTruthy();
    expect(screen.queryByLabelText("Conditions status")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Legal and support" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Developer status")).not.toBeInTheDocument();

    const bottomNav = screen.getAllByRole("navigation", { name: "Primary" })[1];
    expect(bottomNav.className).toContain("bottom-0");
    expect(bottomNav.className).toContain("inset-x-0");
    expect(bottomNav.firstElementChild?.className).toContain(
      "pb-[max(env(safe-area-inset-bottom,0px),0.5rem)]",
    );
  });

  it("keeps tablet/desktop map chrome with in-flow footers and min-h-screen shell", () => {
    usePhonePortraitMock.mockReturnValue(false);
    renderShell("/map");

    const main = screen.getByText("Placeholder content").closest("main");
    expect(main?.className).toContain("pb-24");
    expect(main?.className).toContain("flex-1");
    expect(screen.getByText("Placeholder content").closest("div.min-h-screen")).toBeTruthy();
    expect(screen.getByLabelText("Conditions status")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Legal and support" })).toBeInTheDocument();
    expect(screen.getByLabelText("Developer status")).toBeInTheDocument();
  });
});
