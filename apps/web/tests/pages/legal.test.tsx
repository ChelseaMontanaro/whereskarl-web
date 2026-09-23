// @vitest-environment happy-dom

import { cleanup, render, screen, within } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import PrivacyPage from "@/app/privacy/page";
import SupportPage from "@/app/support/page";

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

vi.mock("next/navigation", () => ({
  usePathname: () => "/privacy",
}));

describe("legal pages", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the approved privacy copy with a support link and mailto", () => {
    render(createElement(PrivacyPage));

    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy Policy" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Last updated: September 22, 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Information We Collect" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/does not currently require an account or sign-in/i)).toBeInTheDocument();
    expect(screen.getByText(/does not currently include advertising, paid subscriptions/i)).toBeInTheDocument();
    expect(screen.getByText(/does not sell your personal information/i)).toBeInTheDocument();
    expect(screen.queryByText(/public support contact is not listed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/will always be free|will never/i)).not.toBeInTheDocument();

    const supportLinks = screen.getAllByRole("link", { name: "Support" });
    expect(
      supportLinks.some(
        (link: HTMLElement) => link.getAttribute("href") === "/support",
      ),
    ).toBe(true);
    expect(screen.getByRole("link", { name: "support@whereskarl.live" })).toHaveAttribute(
      "href",
      "mailto:support@whereskarl.live",
    );
    expect(document.body.innerHTML).not.toMatch(/apps\.apple\.com|itunes\.apple\.com/i);
  });

  it("renders the approved support copy with a mailto and no placeholder contact note", () => {
    render(createElement(SupportPage));

    expect(screen.getByRole("heading", { level: 1, name: "Support" })).toBeInTheDocument();
    expect(screen.getByText(/Need help with Where's Karl\?/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Map" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Favorites" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "If Something Doesn't Look Right" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Still need help?")).toBeInTheDocument();
    expect(screen.getByText("Email us at:")).toBeInTheDocument();
    expect(screen.queryByText(/public support contact is not listed/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "support@whereskarl.live" })).toHaveAttribute(
      "href",
      "mailto:support@whereskarl.live",
    );
    expect(document.body.innerHTML).not.toMatch(/apps\.apple\.com|itunes\.apple\.com/i);
  });

  it("uses the marketing header and keeps the App Store badge non-linking", () => {
    render(createElement(PrivacyPage));

    const siteNav = screen.getByRole("navigation", { name: "Site" });
    expect(within(siteNav).getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(siteNav).getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/#about",
    );
    expect(
      screen.getByLabelText("Download on the App Store. Listing coming soon."),
    ).not.toHaveAttribute("href");
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
  });
});
