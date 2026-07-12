"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/**
 * Canonical map bottom sheet.
 *
 * A single reusable, OS-style bottom sheet for phone-portrait map experiences.
 * The Selected Location sheet is the first consumer; future map surfaces
 * (favorites, search results, region summaries) should render their content
 * through this same component so the interaction language stays identical.
 *
 * Interaction model (shared with the Map Layers sheet's glass treatment):
 *   - anchored above the bottom navigation, rounded top corners, glass blur
 *   - a grab handle that expands/collapses the sheet (tap, keyboard, or drag)
 *   - a persistent `header` (peek) region that is always visible so the user
 *     can immediately understand what is selected
 *   - a collapsible `children` body revealed when expanded
 *
 * The sheet is presentational only — it owns no selection, data, or camera
 * state. Consumers pass content and (optionally) control the expanded detent.
 */

/** Distance (px) a handle drag must travel before it snaps the detent. */
const DRAG_SNAP_THRESHOLD = 28;

export type BottomSheetProps = {
  /** Accessible label for the sheet region. */
  ariaLabel: string;
  /** Always-visible peek content (header + at-a-glance summary). */
  header: ReactNode;
  /** Collapsible body revealed when the sheet is expanded. */
  children?: ReactNode;
  /** Controlled expanded state. Omit for uncontrolled behavior. */
  expanded?: boolean;
  /** Initial expanded state when uncontrolled. Defaults to collapsed. */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Extra classes for the sheet container. */
  className?: string;
  /** Extra classes for the scrollable body wrapper. */
  bodyClassName?: string;
};

const SHEET_CONTAINER_CLASS =
  "pointer-events-auto fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-[26rem] flex-col overflow-hidden rounded-t-[1.75rem] rounded-b-3xl border border-white/12 bg-black/70 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl";

export function BottomSheet({
  ariaLabel,
  header,
  children,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  className = "",
  bodyClassName = "",
}: BottomSheetProps) {
  const bodyId = useId();
  const isControlled = controlledExpanded !== undefined;
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    useState(defaultExpanded);
  const expanded = isControlled ? controlledExpanded : uncontrolledExpanded;

  const setExpanded = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledExpanded(next);
      }
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  // Drag handling: interpret a vertical gesture on the grab handle into a
  // detent change. A meaningful drag suppresses the trailing click so tap and
  // drag don't both fire.
  const dragStartY = useRef<number | null>(null);
  const draggedRef = useRef(false);
  const hasBody = Boolean(children);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      dragStartY.current = event.clientY;
      draggedRef.current = false;
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (dragStartY.current === null) {
        return;
      }

      const delta = event.clientY - dragStartY.current;
      if (Math.abs(delta) < DRAG_SNAP_THRESHOLD) {
        return;
      }

      draggedRef.current = true;
      dragStartY.current = null;
      // Drag up (negative delta) expands; drag down collapses.
      setExpanded(delta < 0);
    },
    [setExpanded],
  );

  const handlePointerEnd = useCallback(() => {
    dragStartY.current = null;
  }, []);

  const handleClick = useCallback(() => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    toggleExpanded();
  }, [toggleExpanded]);

  return (
    <section
      aria-label={ariaLabel}
      className={`${SHEET_CONTAINER_CLASS} ${className}`.trim()}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={hasBody ? bodyId : undefined}
        aria-label={expanded ? "Collapse details" : "Expand details"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClick={handleClick}
        className="flex w-full shrink-0 touch-none items-center justify-center pt-2.5 pb-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karl-gold/50"
      >
        <span
          aria-hidden="true"
          className="h-1 w-9 rounded-full bg-white/30"
        />
      </button>

      <div className="shrink-0 px-4 pb-1">{header}</div>

      {hasBody ? (
        <div
          id={bodyId}
          className={`overflow-hidden px-4 transition-[max-height,opacity] duration-300 ease-out motion-reduce:transition-none ${
            expanded
              ? "max-h-[62dvh] overflow-y-auto overscroll-contain pb-4 opacity-100"
              : "max-h-0 pb-0 opacity-0"
          } ${bodyClassName}`.trim()}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
