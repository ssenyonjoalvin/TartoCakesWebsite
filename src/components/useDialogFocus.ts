"use client";

import { useEffect, type RefObject } from "react";

/** Keep keyboard focus in an open modal and restore it to its trigger. */
export function useDialogFocus(container: RefObject<HTMLElement | null>, open: boolean) {
  useEffect(() => {
    const dialog = container.current;
    if (!open || !dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]),a[href],input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]'
    )).filter((element) => element.getClientRects().length > 0);
    (controls()[0] ?? dialog).focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      if (previous?.isConnected) previous.focus();
    };
  }, [container, open]);
}
