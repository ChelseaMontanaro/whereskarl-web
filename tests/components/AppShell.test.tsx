// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

    const bottomNav = screen.getByRole("navigation", { name: "Primary" });
    for (const label of ["Home", "Map", "Favorites", "Settings"]) {
      expect(within(bottomNav).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("opens the desktop drawer from the hamburger menu", () => {
    renderShell("/");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));

    const drawer = screen.getByRole("dialog", { name: "Navigation menu" });
    expect(within(drawer).getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "Map" })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "Privacy" })).toBeInTheDocument();
  });

  it("highlights the active primary route in the drawer", () => {
    renderShell("/favorites");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));

    const drawer = screen.getByRole("dialog", { name: "Navigation menu" });
    expect(within(drawer).getByRole("link", { name: "Favorites" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(drawer).getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("closes the desktop drawer when the backdrop is clicked", () => {
    renderShell("/");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(screen.getByRole("dialog", { name: "Navigation menu" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
    expect(screen.queryByRole("dialog", { name: "Navigation menu" })).not.toBeInTheDocument();
  });

  it("closes the desktop drawer when Escape is pressed", () => {
    renderShell("/");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(screen.getByRole("dialog", { name: "Navigation menu" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Navigation menu" })).not.toBeInTheDocument();
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
