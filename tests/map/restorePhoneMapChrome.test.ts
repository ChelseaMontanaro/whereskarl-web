// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  hasStaleVisualViewportOffset,
  isPhoneMapKeyboardLikelyOpen,
  isPhoneMapSearchKeyboardSessionActive,
  restorePhoneMapChrome,
  subscribePhoneMapChromeViewportRecovery,
} from "@/lib/map/restorePhoneMapChrome";

function mockVisualViewport(options: {
  height: number;
  offsetTop?: number;
  offsetLeft?: number;
  innerHeight?: number;
}) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: options.innerHeight ?? 844,
  });
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: {
      height: options.height,
      offsetTop: options.offsetTop ?? 0,
      offsetLeft: options.offsetLeft ?? 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
}

describe("restorePhoneMapChrome", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: undefined,
    });
  });

  it("blurs text entry and is a no-op scroll when the viewport is already settled", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;
    mockVisualViewport({ height: 844, offsetTop: 0 });

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    expect(document.activeElement).toBe(input);

    restorePhoneMapChrome();

    expect(document.activeElement).not.toBe(input);
    // Settled viewport: no iOS nudge, no window scroll.
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("is idempotent: repeated restores do not accumulate scroll or offsets", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;
    mockVisualViewport({ height: 844, offsetTop: 120 });

    restorePhoneMapChrome();
    const callsAfterFirst = scrollTo.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(0);

    // After a successful clear, offsets are still mocked as 120 unless we
    // update the mock — simulate a settled viewport for subsequent calls.
    mockVisualViewport({ height: 844, offsetTop: 0, offsetLeft: 0 });
    scrollTo.mockClear();
    restorePhoneMapChrome();
    restorePhoneMapChrome();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("resets the phone map root scroll container only while clearing a stale offset", () => {
    window.scrollTo = vi.fn();
    mockVisualViewport({ height: 844, offsetTop: 40 });
    const root = document.createElement("div");
    root.setAttribute("data-karl-phone-map-root", "");
    root.scrollTop = 48;
    document.body.appendChild(root);

    restorePhoneMapChrome();

    expect(root.scrollTop).toBe(0);
  });

  it("clears a stale visualViewport.offsetTop after the keyboard session ended", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;
    // Full height + residual offsetTop = stale Safari state (not live keyboard).
    mockVisualViewport({ height: 844, offsetTop: 120, offsetLeft: 0 });

    expect(isPhoneMapKeyboardLikelyOpen()).toBe(false);
    expect(hasStaleVisualViewportOffset()).toBe(true);
    expect(isPhoneMapSearchKeyboardSessionActive()).toBe(false);

    restorePhoneMapChrome();

    expect(scrollTo).toHaveBeenCalledWith(0, 120);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("does not treat a non-zero offsetTop alone as an active keyboard session", () => {
    mockVisualViewport({ height: 844, offsetTop: 80 });
    expect(isPhoneMapKeyboardLikelyOpen()).toBe(false);
    expect(isPhoneMapSearchKeyboardSessionActive()).toBe(false);
    expect(hasStaleVisualViewportOffset()).toBe(true);
  });

  it("treats a compressed visual viewport height as an active keyboard session", () => {
    mockVisualViewport({ height: 400, offsetTop: 0, innerHeight: 844 });
    expect(isPhoneMapKeyboardLikelyOpen()).toBe(true);
    expect(isPhoneMapSearchKeyboardSessionActive()).toBe(true);
    expect(hasStaleVisualViewportOffset()).toBe(false);
  });

  it("treats focused search input as an active session even with full height", () => {
    mockVisualViewport({ height: 844, offsetTop: 0 });
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    expect(isPhoneMapSearchKeyboardSessionActive()).toBe(true);
  });

  it("does not use requestAnimationFrame for chrome restoration", () => {
    const source = readFileSync(
      join(process.cwd(), "lib/map/restorePhoneMapChrome.ts"),
      "utf8",
    );
    expect(source).not.toContain("requestAnimationFrame");
    expect(source).not.toContain("setTimeout");
  });

  it("subscribes to visualViewport resize and scroll and cleans up listeners", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 844,
    });
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: {
        height: 500,
        offsetTop: 0,
        offsetLeft: 0,
        addEventListener,
        removeEventListener,
      },
    });

    const unsubscribe = subscribePhoneMapChromeViewportRecovery();
    expect(addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(addEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));

    unsubscribe();
    expect(removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
  });

  it("clears stale offset when viewport height grows after keyboard dismiss", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    let resizeHandler: (() => void) | undefined;
    const viewport = {
      height: 400,
      offsetTop: 0,
      offsetLeft: 0,
      addEventListener: (type: string, handler: () => void) => {
        if (type === "resize") {
          resizeHandler = handler;
        }
      },
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 844,
    });
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: viewport,
    });

    const unsubscribe = subscribePhoneMapChromeViewportRecovery();
    expect(resizeHandler).toBeTypeOf("function");

    scrollTo.mockClear();
    // Keyboard gone: height recovers, residual offset appears.
    viewport.height = 844;
    viewport.offsetTop = 96;
    resizeHandler?.();
    expect(scrollTo).toHaveBeenCalledWith(0, 96);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);

    unsubscribe();
  });

  it("does not clear viewport while a text input remains focused", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    let resizeHandler: (() => void) | undefined;
    const viewport = {
      height: 400,
      offsetTop: 0,
      offsetLeft: 0,
      addEventListener: (type: string, handler: () => void) => {
        if (type === "resize") {
          resizeHandler = handler;
        }
      },
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 844,
    });
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: viewport,
    });

    const unsubscribe = subscribePhoneMapChromeViewportRecovery();
    scrollTo.mockClear();
    viewport.height = 700;
    resizeHandler?.();
    expect(scrollTo).not.toHaveBeenCalled();

    unsubscribe();
    input.remove();
  });
});

describe("phone portrait search sheet presentation (source locks)", () => {
  it("uses one canonical BottomSheet for phone selected locations with no search-specific height", () => {
    const card = readFileSync(
      join(process.cwd(), "components/map/MapSelectedLocationCard.tsx"),
      "utf8",
    );
    const mapView = readFileSync(
      join(process.cwd(), "components/map/MapView.tsx"),
      "utf8",
    );
    const search = readFileSync(
      join(process.cwd(), "components/map/MapPhonePortraitControls.tsx"),
      "utf8",
    );
    const bottomSheet = readFileSync(
      join(process.cwd(), "components/ui/BottomSheet.tsx"),
      "utf8",
    );
    const mapPage = readFileSync(join(process.cwd(), "app/map/page.tsx"), "utf8");
    const restore = readFileSync(
      join(process.cwd(), "lib/map/restorePhoneMapChrome.ts"),
      "utf8",
    );

    expect(card).toContain('import { BottomSheet } from "@/components/ui/BottomSheet"');
    expect(card).toContain("defaultExpanded={false}");
    expect(card).toContain("key={location.id}");
    expect(card).toContain("surfaceExpandArmed");
    expect(mapView).toContain("key={selectedLocation.id}");
    expect(mapView).toContain("restorePhoneMapChrome()");
    expect(mapView).toContain("subscribePhoneMapChromeViewportRecovery()");
    expect(search).toContain("restorePhoneMapChrome()");
    expect(search).toContain("onBlur=");
    expect(search).not.toContain("max-h-[62dvh]");
    expect(search).not.toContain("bottom-[calc(");
    expect(mapPage).toContain("data-karl-phone-map-root");
    expect(restore).not.toContain("requestAnimationFrame");
    expect(restore).not.toContain("translateY");
    expect(restore).not.toContain("paddingBottom");
    // Selection must close the overlay synchronously — no deferred close.
    expect(search).toMatch(
      /closeOverlay\(\);\s*inputRef\.current\?\.blur\(\);\s*restorePhoneMapChrome\(\);\s*onSelectLocation\(location\.id\);/,
    );
    expect(search).not.toMatch(
      /handleSelectResult[\s\S]*requestAnimationFrame/,
    );
    expect(search).not.toMatch(
      /handleSelectResult[\s\S]*setTimeout\([\s\S]*closeOverlay/,
    );
    expect(bottomSheet).toContain(
      "bottom-[calc(4.75rem+env(safe-area-inset-bottom))]",
    );
    expect(bottomSheet).toContain("max-h-[62dvh]");
  });

  it("keeps AppShell bottom nav always mounted on /map (not search-gated)", () => {
    const appShell = readFileSync(
      join(process.cwd(), "components/layout/AppShell.tsx"),
      "utf8",
    );

    expect(appShell).toContain("<BottomNav />");
    expect(appShell).not.toContain("isSearch");
    expect(appShell).not.toContain("isKeyboard");
    expect(appShell).not.toContain("sessionStorage");
    expect(appShell).not.toContain("localStorage");
    expect(appShell).not.toContain("translateY");
    expect(appShell).not.toContain("visualViewport");
  });
});
