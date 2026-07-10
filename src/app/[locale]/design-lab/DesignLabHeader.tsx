"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { homePath } from "@/sanity/paths";
import { ChannelPickerDialog, type ChannelPickerDialogHandle } from "./ChannelPickerDialog";
import type { HeaderNavItem } from "./headerNavItems";
import { HeaderNavItemWithSubmenu } from "./HeaderNavItemWithSubmenu";
import { MobileMenuOverlay } from "./MobileMenuOverlay";
import styles from "./design-lab.module.scss";

// Revision round 4: replaces the old continuous --header-progress
// interpolation (0 at scrollY=0, 1 at scrollY>=120px) with a genuine
// two-state switch, per spec — collapse past 150px, expand back below
// 90px, the gap between them a deliberate hysteresis dead zone so a
// visitor sitting right at one boundary doesn't thrash the header back
// and forth on every pixel of scroll jitter.
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

// Design-lab-only header (DesignLabHeader.tsx) previewing what the real,
// shared src/components/Header.tsx should become — that component is
// production code and stays untouched this pass (same rule as the
// Footer/DesignLabFooter precedent), see design-lab.module.scss's own
// comment on the :global rule that hides it on THIS route only.
//
// Revision round 4 — HONESTY-RULE DIAGNOSIS (see the pass's final report
// for the full scrollY/state log): the OLD continuous
// --header-progress interpolation was NOT actually broken — verified in
// the production build via both instant-programmatic scroll and real
// wheel-scroll simulation, at 0/200/600px, with console/hydration checks
// clean. The most likely source of the ORIGINAL bug report: this
// project's own global `html { scroll-behavior: smooth }` rule
// (globals.scss) makes a plain, un-annotated `window.scrollTo(0, y)` (the
// kind typed into devtools, or issued by a testing/automation tool)
// ANIMATE gradually rather than jump — inspecting the header's state
// shortly after issuing such a command catches it mid-animation, near
// the START of a slow easing curve, which reads exactly like "stuck past
// 150px." (This is the SAME class of bug already found and fixed for
// the Diplomi viewer's scroll restore in an earlier pass.) Separately,
// checking classList specifically (as this round's own diagnostic
// steps assumed) would ALSO always show "no change," because this
// component never toggled a class in the first place — it wrote a CSS
// custom property + a data-attribute instead, a different but equally
// valid mechanism classList inspection alone can't see.
//
// Regardless of that root-cause finding, this round's own spec asks for
// a different mechanism outright: a genuine two-state switch (collapse
// past 150px, expand below 90px, hysteresis dead zone between) instead
// of continuous interpolation. --header-progress is retired entirely;
// every dependent visual in design-lab.module.scss now keys off a single
// data-collapsed attribute, written to both the header and the CTA
// button from the SAME boolean, with a 250ms CSS transition on the
// affected properties (instant under reduced motion — see that
// override in design-lab.module.scss).
export function DesignLabHeader({
  navItems,
  locale,
}: {
  navItems: HeaderNavItem[];
  locale: "it" | "en";
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

    // "Reduced-motion: instant state switch, transitions 0ms" — per this
    // round's own spec, this is a real behavior change from the old
    // "no listener attached, permanently collapsed" rule: the state must
    // still track scroll under reduced motion, just without an animated
    // transition (the 0ms override lives in design-lab.module.scss, not
    // here — this effect runs unconditionally now).
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

    // HONESTY-RULE CATCH (own bug, caught before shipping via the
    // instant-scrollTo trace this round's own QA required, not assumed
    // fixed on first write): an earlier draft of this rAF gate never
    // cleared rafId back to null inside the callback, only inside
    // onScroll's own early-return check. That meant the FIRST scroll
    // event after mount armed a single requestAnimationFrame, and once
    // that frame ran, rafId stayed non-null forever — every scroll event
    // after the first was silently dropped, freezing data-collapsed at
    // whatever update() saw on that one frame regardless of how far the
    // page scrolled afterward. Reproduced with a 0->600->0 instant-scroll
    // trace (logged in this round's report): collapsed at the first pass
    // over 150px, then never budged again on the way back down. Fixed by
    // resetting rafId inside the callback itself, matching the pattern
    // RecognitionStage.tsx already uses for the same reason.
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

  // Lab-local IT/EN pair — deliberately NOT the real LocaleSwitcher.tsx,
  // same reasoning as DesignLabFooter.tsx's own designLabPath() (that
  // component resolves arbitrary pillar/subtopic alternates this
  // noindex-anyway lab page never sets, so it would silently fall back to
  // linking the homepage instead of this page).
  function designLabPath(target: "it" | "en"): string {
    return target === "it" ? "/design-lab" : "/en/design-lab";
  }
  const localePair = {
    it: { active: locale === "it", href: designLabPath("it") },
    en: { active: locale === "en", href: designLabPath("en") },
  };

  return (
    <>
      <header className={styles.labHeader} ref={headerRef} data-lab-header="true" data-collapsed="false">
        <div className={styles.labHeaderInner}>
          {/* Matches the real Header's own wordmark-links-home pattern
              (homePath), not a self-referencing lab link — consistent
              with every other nav item here also using the real route
              convention (most landing on the site's not-found page today,
              same as the real Header's own nav, per that file's comment). */}
          <Link href={homePath(locale)} className={styles.labHeaderWordmark}>
            Giuseppe Iannone
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
              {localePair.it.active ? (
                <span className={styles.labHeaderLocaleCurrent}>IT</span>
              ) : (
                <Link href={localePair.it.href} lang="it" className={styles.labHeaderLocaleLink}>
                  IT
                </Link>
              )}
              {" / "}
              {localePair.en.active ? (
                <span className={styles.labHeaderLocaleCurrent}>EN</span>
              ) : (
                <Link href={localePair.en.href} lang="en" className={styles.labHeaderLocaleLink}>
                  EN
                </Link>
              )}
            </p>
            <button
              ref={buttonRef}
              type="button"
              data-collapsed="false"
              className={`${styles.btnSecondary} ${styles.labHeaderCta}`}
              onClick={() => dialogRef.current?.open()}
            >
              Prenota un primo colloquio
            </button>
            <button
              ref={mobileToggleRef}
              type="button"
              className={styles.labHeaderBurger}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Chiudi il menu" : "Apri il menu"}
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              {/* Revision round 1, item 9: three bars (was two) — the SAME
                  three spans morph into an X via CSS transform on
                  aria-expanded, no icon swap. See design-lab.module.scss's
                  .labHeaderBurgerBar for the morph mechanism. */}
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
        localePair={localePair}
        toggleRef={mobileToggleRef}
        headerRef={headerRef}
      />

      {/* Colocated with the button that triggers it, rather than lifted
          to page.tsx — nothing else on the page needs to open it. */}
      <ChannelPickerDialog ref={dialogRef} />
    </>
  );
}
