"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { AreaGroup } from "@/sanity/areaTaxonomy";
import type { Locale } from "@/sanity/paths";
import type { HeaderNavItem } from "./headerNavItems";
import { useLenisRef } from "@/components/LenisProvider";
import styles from "./HeaderInteractive.module.scss";

// Parent-that's-also-a-link pass — same dictionary pattern as
// HeaderNavItemWithSubmenu.tsx's own SUBMENU_TOGGLE_LABEL, for the mobile
// chevron toggle's own accessible name once it's no longer sharing text
// with a visible label.
const MOBILE_SUBMENU_TOGGLE_LABEL: Record<Locale, (label: string) => string> = {
  it: (label) => `Apri il sottomenu di ${label}`,
  en: (label) => `Open ${label} submenu`,
};

// Rebuild pass — the overlay's own accessible name, now that it carries
// real dialog semantics (role="dialog" aria-modal="true") instead of
// being a plain, unannounced <div>.
const MOBILE_MENU_DIALOG_LABEL: Record<Locale, string> = {
  it: "Menu principale",
  en: "Main menu",
};

// Header nav restructure pass — a second, nested accordion tier, used only
// inside the "Aree" top-level accordion panel: one row per pillar, each
// independently collapsed by default and expanding on tap (owner's own
// spec), revealing that pillar's own subtopic links. The pillar's own
// TITLE is a real link (tapping it navigates straight to the pillar page,
// same as the desktop panel's own heading-is-a-link pattern) — a separate
// chevron button alongside it is the actual expand/collapse control, so
// "go to this pillar" and "see its subtopics first" are two distinct,
// unambiguous tap targets rather than one element trying to be both a link
// and a disclosure button.
function MobileAreaAccordion({ groups, onClose }: { groups: AreaGroup[]; onClose: () => void }) {
  const [openPillar, setOpenPillar] = useState<string | null>(null);

  return (
    <ul className={styles.mobileMenuAreaPillarList}>
      {groups.map((group) => {
        const isOpen = openPillar === group.href;
        return (
          <li key={group.href} className={styles.mobileMenuAreaPillar}>
            <div className={styles.mobileMenuAreaPillarRow}>
              <Link href={group.href} className={styles.mobileMenuAreaPillarLink} onClick={onClose}>
                {group.title}
              </Link>
              {group.subtopics.length > 0 ? (
                <button
                  type="button"
                  className={styles.mobileMenuAreaPillarToggle}
                  aria-expanded={isOpen}
                  aria-label={group.title}
                  onClick={() => setOpenPillar(isOpen ? null : group.href)}
                >
                  <span
                    className={styles.mobileMenuChevron}
                    data-open={isOpen ? "true" : undefined}
                    aria-hidden="true"
                  />
                </button>
              ) : null}
            </div>
            {group.subtopics.length > 0 ? (
              <div
                className={styles.mobileMenuAreaSubtopicPanelWrap}
                data-open={isOpen ? "true" : undefined}
                inert={!isOpen}
              >
                <div className={styles.mobileMenuAreaSubtopicPanelInner}>
                  <ul className={styles.mobileMenuAreaSubtopicList}>
                    {group.subtopics.map((subtopic) => (
                      <li key={subtopic.href}>
                        <Link href={subtopic.href} className={styles.mobileMenuChildLink} onClick={onClose}>
                          {subtopic.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

// Full-screen overlay for the burger menu (<=1023px) — dark-green ground
// (--color-bg, rebuild pass; was --color-accent/gold), gold items. Focus
// trap + Esc-closes technique originally modeled on the pre-promotion
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
  areaTaxonomy,
  locale,
  toggleRef,
  headerRef,
}: {
  open: boolean;
  onClose: () => void;
  navItems: HeaderNavItem[];
  areaTaxonomy: AreaGroup[];
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
        // preventScroll — see this pass's own report for the diagnosis:
        // every .focus() call in this handler gets it, not just the one
        // proven live, since the same fixed-overlay-vs-scrolled-document
        // mismatch could in principle trigger it from any of them.
        toggleRef.current?.focus({ preventScroll: true });
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }

    // Modal pass — "this one IS modal, unlike the consent banner": the
    // Tab-cycling trap above already stops KEYBOARD focus from leaving
    // {header, overlay}, but a screen reader's own browse-mode (arrow-key)
    // navigation doesn't go through Tab at all, so it could still reach
    // page content underneath without this. Every direct <body> child
    // except the header and the overlay itself gets marked inert — native
    // (removes the whole subtree from both focus and the accessibility
    // tree in one step, same mechanism already used for the collapsed
    // accordion panels elsewhere in this file, applied here to the rest
    // of the PAGE instead of a panel). The DOM here is flat (confirmed
    // live): CookieConsentBanner's own two divs, <main>, the footer's
    // tone-wrap, trailing dialogs/scripts — no single wrapping element
    // exists to target instead.
    const inertedSiblings: HTMLElement[] = [];
    for (const child of Array.from(document.body.children)) {
      if (!(child instanceof HTMLElement)) continue;
      if (child === headerRef.current || child === overlayRef.current) continue;
      if (child.tagName === "SCRIPT") continue;
      if (!child.inert) {
        child.inert = true;
        inertedSiblings.push(child);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    // No-layout-shift pass — caught live (measured a header control's own
    // position before/after open, not assumed): scrollbar-gutter:stable
    // reserves gutter space unconditionally whenever it's set, which only
    // avoids a shift if a real, width-consuming scrollbar was there to
    // begin with. This site's own scroll (Lenis) and this test/mobile
    // context both render with a non-width-consuming (overlay-style)
    // scrollbar — innerWidth === clientWidth even on a genuinely tall,
    // scrollable page — so reserving a gutter here was introducing a real
    // ~15px inward shift of the header's own CTA that didn't exist
    // before, the opposite of this property's purpose. Checked directly
    // (innerWidth vs. clientWidth, not content height, which was the
    // wrong signal — a tall page can still have a non-width-consuming
    // scrollbar) right before locking; only reserved when there's an
    // actual scrollbar to compensate for.
    // Scroll-jump fix, part 2 — diagnosed live (this pass's own re-
    // verification, correcting an earlier diagnosis in this project's
    // history that blamed the fix below solely on focus-driven
    // scroll-into-view): on this site, document.body.style.overflow =
    // "hidden" ALONE, independent of the firstLinkRef focus call already
    // fixed with preventScroll, resets window.scrollY to 0 the instant
    // it's applied — confirmed by toggling each lock mechanism off in
    // isolation (Lenis.stop() first, then this line) and re-measuring;
    // only removing THIS line kept scrollY unchanged. Body's overflow
    // becomes the propagated root/viewport overflow per the CSS spec
    // (html has no overflow of its own set here), so hiding it hides the
    // one native scrolling box the page has — Chrome reports/repaints
    // that as scrollY=0 immediately, not merely "not scrollable at the
    // same offset." Invisible while open (the overlay is a full-bleed
    // fixed panel below the header, so there's no background page to see
    // snap to top) but never restored on close, which is the user-visible
    // symptom. Captured here, BEFORE the lock is applied, and restored in
    // the cleanup below BEFORE Lenis resumes — so Lenis's own native-
    // scroll-tracking (see LenisProvider.tsx's own comment: it drives
    // window.scrollTo() and reads window.scrollY as authoritative) picks
    // up the correct position on its very next frame instead of the
    // zeroed one.
    const scrollY = window.scrollY;
    const hasWidthConsumingScrollbar = window.innerWidth > document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    // Reserves scrollbar space only while actually locked — see
    // ChannelPickerDialog.tsx's own comment (a regression diff caught an
    // earlier draft applying this permanently via CSS instead, shrinking
    // every section's width by ~15px at all times, not just while a
    // dialog/menu is genuinely open). ChannelPickerDialog.tsx doesn't yet
    // carry the hasWidthConsumingScrollbar guard added here — flagged for
    // a follow-up, not fixed there, since that dialog was outside this
    // pass's scope.
    if (hasWidthConsumingScrollbar) {
      document.documentElement.style.scrollbarGutter = "stable";
    }
    // Same reasoning as ChannelPickerDialog.tsx's own lenis.stop() —
    // this overlay only opens below 1024px, but that includes narrow
    // fine-pointer desktop windows where Lenis can genuinely be running,
    // not just touch viewports. No-op when it isn't.
    lenisRef?.current?.stop();
    // No dedicated close button to focus anymore — the first nav link is
    // the natural first stop (the header bar's own controls, including
    // the burger-as-X, stay reachable via Shift+Tab from here).
    //
    // Scroll-jump fix — diagnosed live (a real scroll/focusin event trace
    // from the middle of a long page, not a guess): this exact .focus()
    // call was the cause. Confirmed by timestamp — window.scrollY snapped
    // to 0 in the SAME tick the focusin event landed on this link, not
    // before and not from any lock/reset elsewhere. The overlay is
    // position: fixed and already fully within the viewport regardless of
    // the document's own scroll offset, so there was never a legitimate
    // reason for the browser to scroll the document at all here —
    // preventScroll suppresses exactly that automatic "scroll the newly
    // focused element into view" behavior without changing what receives
    // focus.
    firstLinkRef.current?.focus({ preventScroll: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.documentElement.style.scrollbarGutter = "";
      for (const el of inertedSiblings) el.inert = false;
      // Restore the position overflow:hidden zeroed above, before Lenis
      // resumes (see this effect's own comment on `scrollY` for why the
      // ordering matters). Real bug, found live: the plain two-argument
      // scrollTo(0, scrollY) this used to be is NOT actually instant —
      // globals.scss sets `scroll-behavior: smooth` on <html> under
      // prefers-reduced-motion: no-preference, and the two-argument form
      // inherits that CSS property same as a user-triggered scroll would,
      // animating from 0 up to scrollY over the browser's own smooth-
      // scroll duration. Invisible while the overlay was still fully
      // covering the viewport (this project's OWN opening-scroll fix
      // never caught it for the same reason), but the closing exit
      // animation reveals the page underneath while this runs, so the
      // animated catch-up became the visible "travels from the top back
      // down" bug. { behavior: "instant" } explicitly opts out of the
      // CSS property, matching what the comment here always claimed but
      // the code never actually did.
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
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
    <div
      className={styles.mobileMenuOverlay}
      ref={overlayRef}
      data-open={open ? "true" : undefined}
      role="dialog"
      aria-modal={open ? "true" : undefined}
      aria-label={MOBILE_MENU_DIALOG_LABEL[locale]}
    >
      <nav className={styles.mobileMenuNav} aria-label="Menu principale">
        <ul className={styles.mobileMenuList}>
          {navItems.map((item, index) => {
            const style = { ["--mobile-menu-item-index" as string]: index } as React.CSSProperties;

            if (item.usesPillarTaxonomy) {
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
                  {/* inert while closed — caught by this pass's own keyboard
                      pass: .mobileMenuAccordionPanelWrap's grid-rows(0fr) +
                      overflow:hidden collapses the panel to zero HEIGHT and
                      clips it visually, but neither actually removes its
                      links from the tab order — Tab was reaching pillar
                      headings, and even THEIR OWN still-collapsed subtopic
                      links two levels down, before "Aree" was ever
                      activated. Pre-existing on the original flat-children
                      accordion too (same class, same gap — see the other
                      accordion branch below, fixed identically), just not
                      caught until this pass's own nested case made it more
                      obviously wrong. inert (native, React 19) removes the
                      whole subtree from both tab order and the
                      accessibility tree in one step, toggled off the instant
                      it opens — the CSS transition still runs regardless,
                      inert only gates focusability/AT exposure. */}
                  <div
                    className={styles.mobileMenuAccordionPanelWrap}
                    data-open={isOpen ? "true" : undefined}
                    inert={!isOpen}
                  >
                    <div className={styles.mobileMenuAccordionPanelInner}>
                      <MobileAreaAccordion groups={areaTaxonomy} onClose={onClose} />
                    </div>
                  </div>
                </li>
              );
            }

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
                {/* Parent-that's-also-a-link pass — same split as the
                    desktop trigger row (HeaderNavItemWithSubmenu.tsx's own
                    comment has the full reasoning): when this item ALSO
                    has its own href ("Chi sono"), the label is a real
                    <Link> (tap navigates) and a separate chevron <button>
                    is the only thing that expands the panel — two
                    unambiguous tap targets instead of one control trying
                    to do both. Grouping-only items with no href of their
                    own keep the single combined button below, unchanged. */}
                {item.href ? (
                  <div className={styles.mobileMenuTriggerRow}>
                    <Link
                      href={item.href}
                      className={styles.mobileMenuLink}
                      onClick={onClose}
                      ref={index === 0 ? firstLinkRef : undefined}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      className={styles.mobileMenuAccordionToggle}
                      aria-expanded={isOpen}
                      aria-label={MOBILE_SUBMENU_TOGGLE_LABEL[locale](item.label)}
                      onClick={() => setOpenAccordion(isOpen ? null : item.label)}
                    >
                      <span className={styles.mobileMenuChevron} data-open={isOpen ? "true" : undefined} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.mobileMenuAccordionButton}
                    aria-expanded={isOpen}
                    onClick={() => setOpenAccordion(isOpen ? null : item.label)}
                  >
                    {item.label}
                    <span className={styles.mobileMenuChevron} data-open={isOpen ? "true" : undefined} aria-hidden="true" />
                  </button>
                )}
                <div
                  className={styles.mobileMenuAccordionPanelWrap}
                  data-open={isOpen ? "true" : undefined}
                  inert={!isOpen}
                >
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
