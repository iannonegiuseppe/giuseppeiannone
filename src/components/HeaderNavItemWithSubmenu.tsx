"use client";

import Link from "next/link";
import type { Locale } from "@/sanity/paths";
import type { HeaderNavItem } from "./headerNavItems";
import { useNavDropdownDisclosure } from "./useNavDropdownDisclosure";
import styles from "./HeaderInteractive.module.scss";

// A top-level nav item with a flat submenu (currently: "Chi sono" → Libri).
// Open/close mechanics (hover-intent, click, Escape, focus-out,
// click-outside) live in useNavDropdownDisclosure, shared with
// HeaderAreaMenu.tsx — this component only owns what's specific to a FLAT
// submenu list.
//
// Parent-that's-also-a-link pass — item.href, when present, splits the
// trigger into two independent controls instead of one combined button:
// a real <Link> for the label (click/tap navigates to the parent's own
// page) and a separate chevron <button> (click/tap opens the panel). They
// can't fight each other because they're sibling elements, not one
// overloaded control — a click lands on exactly one of them, never both.
// Hover-intent still opens the panel on either (handleMouseEnter/-Leave
// are bound to the shared ROOT wrap, unaffected by what's inside it).
// Keyboard: Tab reaches the link first (Enter navigates), then the
// chevron button (Enter/Space opens the panel) — two distinct stops, so a
// keyboard user (no hover) can do both independently. When item.href is
// absent (a pure grouping label, no page of its own), this falls back to
// the original single combined button — unchanged from before this pass.
const SUBMENU_TOGGLE_LABEL: Record<Locale, (label: string) => string> = {
  it: (label) => `Apri il sottomenu di ${label}`,
  en: (label) => `Open ${label} submenu`,
};

export function HeaderNavItemWithSubmenu({
  item,
  locale,
  isOpen,
  onOpenChange,
}: {
  item: HeaderNavItem;
  locale: Locale;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    rootRef,
    buttonRef,
    panelId,
    clearCloseTimer,
    handleMouseEnter,
    handleMouseLeave,
    handleButtonClick,
    handleKeyDown,
    handleFocusOut,
  } = useNavDropdownDisclosure(isOpen, onOpenChange);

  return (
    <div
      ref={rootRef}
      className={styles.headerNavItemWrap}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={clearCloseTimer}
      onBlurCapture={handleFocusOut}
      onKeyDown={handleKeyDown}
    >
      {item.href ? (
        <span className={styles.headerNavTriggerRow}>
          <Link href={item.href} className={styles.labHeaderNavLink}>
            {item.label}
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className={styles.headerNavChevronButton}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={SUBMENU_TOGGLE_LABEL[locale](item.label)}
            onClick={handleButtonClick}
          >
            <span className={styles.headerNavChevron} data-open={isOpen ? "true" : undefined} aria-hidden="true" />
          </button>
        </span>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          className={styles.headerNavButton}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={handleButtonClick}
        >
          {item.label}
          <span className={styles.headerNavChevron} data-open={isOpen ? "true" : undefined} aria-hidden="true" />
        </button>
      )}
      <div id={panelId} className={styles.headerSubmenuPanel} data-open={isOpen ? "true" : undefined}>
        <ul className={styles.headerSubmenuList}>
          {item.children?.map((child) => (
            <li key={child.label}>
              <Link href={child.href} className={styles.headerSubmenuLink}>
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
