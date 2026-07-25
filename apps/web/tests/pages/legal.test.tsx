// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
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

describe("legal pages", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the privacy page with accurate product disclosures", () => {
    render(createElement(PrivacyPage));

    expect(screen.getByRole("heading", { name: "Privacy" })).toBeInTheDocument();
    expect(screen.getByText(/does not offer account creation/i)).toBeInTheDocument();
    expect(screen.getByText(/does not sell personal data/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders the support page with product guidance and a contact placeholder", () => {
    render(createElement(SupportPage));

    expect(screen.getByRole("heading", { name: "Support" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Find Clear Skies" })).toBeInTheDocument();
    expect(screen.getByText(/San Francisco, North Bay, East Bay, South Bay/i))
      .toBeInTheDocument();
    expect(screen.getByText(/left for later configuration/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
