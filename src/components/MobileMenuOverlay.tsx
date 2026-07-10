"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { Locale } from "@/sanity/paths";
import type { HeaderNavItem } from "./headerNavItems";
import { useLenisRef } from "@/components/LenisProvider";
import styles from "./HeaderInteractive.module.scss";

// Full-screen pine overlay for the burger menu (<=1023px). Focus trap +
// Esc-closes technique originally modeled on the pre-promotion
// src/components/MobileNav.tsx (since removed — this component replaced
// it entirely as part of the homepage promotion) — same
// querySelector('a[href], button:not([disabled])') trap, same
// Esc-returns-focus-to-toggle behavior. Accordion rows reuse the FAQ
// pass's grid-template-rows 0fr<->1fr technique
// (sectionsShared.module.scss's .faqRowPanelWrap/.faqRowAnswer) rather
// than inventing a max-height variant.
//
// Revision round 2, item 6b: the overlay no longer covers the full
// viewport — it starts BELOW the header bar (wordmark + CTA + the
// burger, now morphed to an X) so that row stays visible and
// interactive while the menu is open. Its own dedicated "×" close
// button is gone — the persistent burger-as-X is now the SOLE click
// target that closes the menu (plus Esc), matching item 6a's "no second
// icon node." The focus trap widens to include the header bar's own
// controls (wordmark link, CTA button, burger button), not just this
// overlay's own content, since those are now reachable while open.
export function MobileMenuOverlay({
  open,
  onClose,
  navItems,
  locale,
  toggleRef,
  headerRef,
}: {
  open: boolean;
  onClose: () => void;
  navItems: HeaderNavItem[];
  locale: Locale;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
  headerRef: React.RefObject<HTMLElement | null>;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const lenisRef = useLenisRef();

  useEffect(() => {
    if (!open) return;

    // One-time measurement, not a scroll-driven loop — the page's own
    // scroll is locked for the whole time the menu is open (below), so
    // the header's rendered height cannot change while this is mounted.
    const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
    overlayRef.current?.style.setProperty("--mobile-menu-top", `${headerHeight}px`);

    function getFocusable(): HTMLElement[] {
      const headerEls = headerRef.current
        ? [...headerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
        : [];
      const overlayEls = overlayRef.current
        ? [...overlayRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
        : [];
      return [...headerEls, ...overlayEls];
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    // Reserves scrollbar space only while actually locked — see
    // ChannelPickerDialog.tsx's own comment (a regression diff caught an
    // earlier draft applying this permanently via CSS instead, shrinking
    // every section's width by ~15px at all times, not just while a
    // dialog/menu is genuinely open).
    document.documentElement.style.scrollbarGutter = "stable";
    // Same reasoning as ChannelPickerDialog.tsx's own lenis.stop() —
    // this overlay only opens below 1024px, but that includes narrow
    // fine-pointer desktop windows where Lenis can genuinely be running,
    // not just touch viewports. No-op when it isn't.
    lenisRef?.current?.stop();
    // No dedicated close button to focus anymore — the first nav link is
    // the natural first stop (the header bar's own controls, including
    // the burger-as-X, stay reachable via Shift+Tab from here).
    firstLinkRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.documentElement.style.scrollbarGutter = "";
      // Same reasoning as ChannelPickerDialog.tsx's own identical
      // suppression: lenisRef holds a plain external instance (not a
      // React-rendered node), and reading `.current` fresh at cleanup
      // time — rather than a value captured at mount — is deliberate.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      lenisRef?.current?.start();
    };
  }, [open, onClose, toggleRef, headerRef, lenisRef]);

  // Always mounted (never `return null` while closed) — a close needs to
  // animate OUT (150ms, no stagger, per spec), which is only possible if
  // the overlay is still in the DOM while that transition runs. Visible/
  // hidden is a CSS data-open switch (visibility+opacity, matching the
  // desktop submenu's own "not display toggling — it kills the
  // transition" rule), not a mount/unmount toggle.
  return (
    <div className={styles.mobileMenuOverlay} ref={overlayRef} data-open={open ? "true" : undefined}>
      <nav className={styles.mobileMenuNav} aria-label="Menu principale">
        <ul className={styles.mobileMenuList}>
          {navItems.map((item, index) => {
            const style = { ["--mobile-menu-item-index" as string]: index } as React.CSSProperties;
            if (!item.children) {
              return (
                <li key={item.label} className={styles.mobileMenuItem} style={style}>
                  <Link
                    href={item.href ?? "#"}
                    className={styles.mobileMenuLink}
                    onClick={onClose}
                    ref={index === 0 ? firstLinkRef : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }

            const isOpen = openAccordion === item.label;
            return (
              <li key={item.label} className={styles.mobileMenuItem} style={style}>
                <button
                  type="button"
                  className={styles.mobileMenuAccordionButton}
                  aria-expanded={isOpen}
                  onClick={() => setOpenAccordion(isOpen ? null : item.label)}
                >
                  {item.label}
                  <span className={styles.mobileMenuChevron} data-open={isOpen ? "true" : undefined} aria-hidden="true" />
                </button>
                <div className={styles.mobileMenuAccordionPanelWrap} data-open={isOpen ? "true" : undefined}>
                  <div className={styles.mobileMenuAccordionPanelInner}>
                    <ul className={styles.mobileMenuChildList}>
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link href={child.href} className={styles.mobileMenuChildLink} onClick={onClose}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.mobileMenuLocalePair}>
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </div>
  );
}
