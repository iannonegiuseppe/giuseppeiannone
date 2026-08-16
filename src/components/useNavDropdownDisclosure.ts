import { useEffect, useId, useRef } from "react";

const CLOSE_INTENT_DELAY_MS = 150;

function isFinePointerWithHover(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

// Header nav restructure pass — extracted verbatim from
// HeaderNavItemWithSubmenu.tsx (previously the only dropdown; behaviour
// unchanged, just no longer duplicated) so the new grouped Aree panel
// (HeaderAreaMenu.tsx) can share the exact same open/close mechanics
// — hover-intent, click, Escape, focus-out, click-outside — rather than a
// second, easy-to-drift copy. What differs between the two callers is only
// what's rendered INSIDE the panel (a flat list vs. a grouped, columned
// one), never how the panel opens/closes/is announced — that part has
// exactly one implementation now.
export function useNavDropdownDisclosure(isOpen: boolean, onOpenChange: (open: boolean) => void) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const panelId = useId();

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      onOpenChange(false);
    }, CLOSE_INTENT_DELAY_MS);
  }

  function handleMouseEnter() {
    if (!isFinePointerWithHover()) return; // coarse pointers ignore hover entirely, per spec
    clearCloseTimer();
    onOpenChange(true);
  }

  function handleMouseLeave() {
    if (!isFinePointerWithHover()) return;
    scheduleClose(); // ~150ms intent delay, absorbs diagonal cursor paths
  }

  function handleButtonClick() {
    if (isFinePointerWithHover()) {
      // Fine pointers: click is just the keyboard-activation path (Enter/
      // Space also fire a button's onClick natively) — always opens,
      // never toggles closed, per spec ("opening on focus alone is NOT
      // allowed" implies click/activate IS allowed and is additive to
      // hover, not a close mechanism).
      onOpenChange(true);
      return;
    }
    // Coarse pointers: first tap opens, second tap closes.
    onOpenChange(!isOpen);
  }

  // Bound to the ROOT wrap (not just the button): the button and the
  // panel's child links are SIBLINGS under the same root div, not nested
  // inside each other, so a keydown fired while focus is on a child link
  // would never reach a handler attached only to the button. Caught
  // empirically on the original flat submenu (an Esc-while-focused-on-the-
  // last-child trace left the panel open and focus stranded on that link,
  // instead of closing and returning focus to the button) — applies
  // identically here, panel content is irrelevant to this bug.
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && isOpen) {
      onOpenChange(false);
      buttonRef.current?.focus();
    }
  }

  // "Focus moving past the last child" closes the panel — a focusout on
  // the whole root (button + panel) whose new target lands OUTSIDE the
  // root closes it. Covers Tab-forward past the last link AND
  // Shift+Tab-backward off the button.
  function handleFocusOut(event: React.FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (!rootRef.current || (next && rootRef.current.contains(next))) return;
    onOpenChange(false);
  }

  // Click-outside: a document-level listener, since clicking a
  // non-focusable point outside (e.g. empty header background) wouldn't
  // otherwise trigger a focusout.
  useEffect(() => {
    if (!isOpen) return;
    function handleDocumentClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [isOpen, onOpenChange]);

  useEffect(() => () => clearCloseTimer(), []);

  return {
    rootRef,
    buttonRef,
    panelId,
    clearCloseTimer,
    handleMouseEnter,
    handleMouseLeave,
    handleButtonClick,
    handleKeyDown,
    handleFocusOut,
  };
}
