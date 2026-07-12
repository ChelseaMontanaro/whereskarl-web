// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BottomSheet } from "@/components/ui/BottomSheet";

afterEach(cleanup);

describe("BottomSheet (canonical map bottom sheet)", () => {
  it("renders a labelled region with a persistent header and a grab handle", () => {
    render(
      <BottomSheet ariaLabel="Selected location: Ocean Beach" header={<h2>Ocean Beach</h2>}>
        <p>Body content</p>
      </BottomSheet>,
    );

    expect(
      screen.getByRole("region", { name: "Selected location: Ocean Beach" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ocean Beach" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand details" }),
    ).toBeInTheDocument();
  });

  it("starts collapsed and expands/collapses when the handle is toggled", () => {
    render(
      <BottomSheet ariaLabel="Sheet" header={<span>Header</span>}>
        <p>Body content</p>
      </BottomSheet>,
    );

    const handle = screen.getByRole("button", { name: "Expand details" });
    expect(handle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(handle);

    const expandedHandle = screen.getByRole("button", { name: "Collapse details" });
    expect(expandedHandle).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(expandedHandle);
    expect(
      screen.getByRole("button", { name: "Expand details" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("respects the defaultExpanded prop", () => {
    render(
      <BottomSheet ariaLabel="Sheet" header={<span>Header</span>} defaultExpanded>
        <p>Body content</p>
      </BottomSheet>,
    );

    expect(
      screen.getByRole("button", { name: "Collapse details" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("supports controlled expanded state via onExpandedChange", () => {
    const onExpandedChange = vi.fn();
    render(
      <BottomSheet
        ariaLabel="Sheet"
        header={<span>Header</span>}
        expanded={false}
        onExpandedChange={onExpandedChange}
      >
        <p>Body content</p>
      </BottomSheet>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand details" }));

    // Controlled: state is owned by the parent, so it reports the request but
    // does not flip its own aria-expanded until the parent updates the prop.
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(
      screen.getByRole("button", { name: "Expand details" }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});
