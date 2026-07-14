"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { homePath, type Locale } from "@/sanity/paths";
import type { ContactChannel, ResolvedLogo } from "@/sanity/seo";
import { ChannelPickerDialog, type ChannelPickerDialogHandle } from "./ChannelPickerDialog";
import type { HeaderNavItem } from "./headerNavItems";
import { HeaderNavItemWithSubmenu } from "./HeaderNavItemWithSubmenu";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { MobileMenuOverlay } from "./MobileMenuOverlay";
import styles from "./HeaderInteractive.module.scss";
import sharedStyles from "./sharedSections.module.scss";

// Promoted from design-lab's own DesignLabHeader.tsx — this is now the
// real site-wide header's interactive core, rendered by Header.tsx (a
// server component that fetches translations/site settings and passes
// them down as props). See that file's own comment for why the split
// exists: getTranslations() is server-only, but the scroll/dialog/burger
// behavior below needs a client component.
//
// Two-state collapse (collapse past 150px, expand below 90px, hysteresis
// dead zone between) — retained verbatim from the design-lab pass that
// built and fixed it (see that pass's own report for the diagnostic
// history: the old continuous --header-progress interpolation was
// replaced with this discrete switch, and a real rAF-gate bug — rafId
// never reset, freezing the state after the first scroll event — was
// caught and fixed via an instant-scrollTo trace before shipping).
const COLLAPSE_AT_PX = 150;
const EXPAND_BELOW_PX = 90;

// Same scroll-container detection as Timeline.tsx/SedesStage.tsx/
// RecognitionHighlightList.tsx — see Timeline.tsx's own comment for the
// full CSS-spec explanation.
function isScrollable(el: HTMLElement): boolean {
  const overflowY = getComputedStyle(el).overflowY;
  return (overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight + 1;
}
function getScrollContainer(): HTMLElement | (Window & typeof globalThis) {
  const { body, documentElement } = document;
  if (isScrollable(body)) return body;
  if (isScrollable(documentElement)) return documentElement;
  return window;
}
function getScrollTop(container: HTMLElement | (Window & typeof globalThis)): number {
  return container instanceof Window ? container.scrollY : container.scrollTop;
}

export function HeaderInteractive({
  navItems,
  locale,
  authorName,
  logo,
  ctaLabel,
  contactChannels,
}: {
  navItems: HeaderNavItem[];
  locale: Locale;
  authorName: string;
  logo?: ResolvedLogo;
  ctaLabel: string;
  contactChannels?: ContactChannel[];
}) {
  const headerRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<ChannelPickerDialogHandle>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    const button = buttonRef.current;
    if (!header || !button) return;

    // Reduced-motion: state still tracks scroll, just without an animated
    // transition (the 0ms override lives in sectionsShared.module.scss) —
    // this effect runs unconditionally regardless of that preference.
    const scrollContainer = getScrollContainer();
    let collapsedRef = false;

    function update() {
      const scrollTop = getScrollTop(scrollContainer);
      if (!collapsedRef && scrollTop > COLLAPSE_AT_PX) {
        collapsedRef = true;
      } else if (collapsedRef && scrollTop < EXPAND_BELOW_PX) {
        collapsedRef = false;
      } else {
        return; // inside the hysteresis dead zone — state unchanged
      }
      const value = collapsedRef ? "true" : "false";
      header!.dataset.collapsed = value;
      button!.dataset.collapsed = value;
    }
    update();

    let rafId: number | null = null;
    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        update();
      });
    }

    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <header className={styles.labHeader} ref={headerRef} data-lab-header="true" data-collapsed="false">
        <div className={styles.labHeaderInner}>
          <Link href={homePath(locale)} className={styles.labHeaderWordmark}>
            <Logo logo={logo} authorName={authorName} imageClassName={styles.labHeaderLogoImage} />
          </Link>

          <nav className={styles.labHeaderNav} aria-label="Menu principale">
            <ul className={styles.labHeaderNavList}>
              {navItems.map((item) =>
                item.children ? (
                  <li key={item.label}>
                    <HeaderNavItemWithSubmenu
                      item={item}
                      isOpen={openSubmenu === item.label}
                      onOpenChange={(open) => setOpenSubmenu(open ? item.label : null)}
                    />
                  </li>
                ) : (
                  <li key={item.label}>
                    <Link href={item.href ?? "#"} className={styles.labHeaderNavLink}>
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className={styles.labHeaderActions}>
            <p className={styles.labHeaderLocalePair}>
              <LocaleSwitcher currentLocale={locale} />
            </p>
            <button
              ref={buttonRef}
              type="button"
              data-collapsed="false"
              className={`${sharedStyles.btnSecondary} ${styles.labHeaderCta}`}
              onClick={() => dialogRef.current?.open()}
            >
              {ctaLabel}
            </button>
            <button
              ref={mobileToggleRef}
              type="button"
              className={styles.labHeaderBurger}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Chiudi il menu" : "Apri il menu"}
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              {/* Three bars morph into an X via CSS transform on
                  aria-expanded, no icon swap — see
                  sectionsShared.module.scss's .labHeaderBurgerBar. */}
              <span className={styles.labHeaderBurgerBar} aria-hidden="true" />
              <span className={styles.labHeaderBurgerBar} aria-hidden="true" />
              <span className={styles.labHeaderBurgerBar} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenuOverlay
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
        locale={locale}
        toggleRef={mobileToggleRef}
        headerRef={headerRef}
      />

      {/* Colocated with the button that triggers it — nothing else on
          the page needs to open it. */}
      <ChannelPickerDialog ref={dialogRef} contactChannels={contactChannels} />
    </>
  );
}
