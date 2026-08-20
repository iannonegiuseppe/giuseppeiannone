"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { homePath, type Locale } from "@/sanity/paths";
import type { ContactChannel } from "@/sanity/seo";
import { ChannelPickerDialog, type ChannelPickerDialogHandle } from "./ChannelPickerDialog";
import type { HeaderNavItem } from "./headerNavItems";
import { HeaderAreaMenu } from "./HeaderAreaMenu";
import { HeaderNavItemWithSubmenu } from "./HeaderNavItemWithSubmenu";
import { LocaleSwitcher } from "./LocaleSwitcher";
import type { AreaGroup } from "@/sanity/areaTaxonomy";
import { SignatureMark } from "./Logo";
import { MobileMenuOverlay } from "./MobileMenuOverlay";
import { Button } from "./Button";
import styles from "./HeaderInteractive.module.scss";

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
  areaTaxonomy,
  locale,
  ctaLabel,
  contactChannels,
}: {
  navItems: HeaderNavItem[];
  areaTaxonomy: AreaGroup[];
  locale: Locale;
  ctaLabel: string;
  contactChannels?: ContactChannel[];
}) {
  const headerRef = useRef<HTMLElement | null>(null);
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<ChannelPickerDialogHandle>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Hover-race fix — diagnosed live (real event trace, not a guess): moving
  // the pointer directly from one dropdown parent to another fires the
  // FIRST item's mouseleave (which schedules a 150ms delayed close, via
  // useNavDropdownDisclosure's own scheduleClose) essentially in the same
  // tick as the SECOND item's mouseenter (which opens immediately, no
  // delay). The second item's open was never the problem — it lands fine.
  // The bug is that the FIRST item's delayed close was never cancelled: it
  // still fires ~150ms later and, because the old callback below wrote
  // `open ? item.label : null` UNCONDITIONALLY, that stale close nulled
  // whatever was CURRENTLY open — the second item — even though it had
  // legitimately taken over. Observed trace (real timestamps, MutationObserver
  // + event listeners): Chi sono mouseleave -> Aree mouseenter (same tick)
  // -> shared state flips to "Aree" (closes Chi sono correctly, as part of
  // the SAME render) -> ~150ms later Chi sono's stale timer fires and nulls
  // the state anyway -> Aree closes on its own, no further pointer movement.
  // Fix: a functional update that only clears the shared state if the
  // caller closing itself is STILL the one recorded as open — a stale
  // close for an item that's no longer current is simply a no-op instead
  // of clobbering whichever item took over since. Each dropdown's own
  // close-intent timer (useNavDropdownDisclosure's closeTimerRef) is
  // per-instance already — the fix belongs here, in how the shared "which
  // one is open" state is written, not in the hook itself.
  function handleSubmenuOpenChange(label: string, open: boolean) {
    setOpenSubmenu((current) => {
      if (open) return label;
      return current === label ? null : current;
    });
  }
  // Header-over-light-hero pass: the pathname-based forceCollapsed check
  // that used to live here (matching /blog and /en/blog by string) is
  // gone — /blog's collapsed-at-rest appearance is now driven by the same
  // `body:has([data-light-hero])` CSS rule /faq uses, keyed off
  // LightPortraitHero's own marker, not a route list (see that component's
  // and HeaderInteractive.module.scss's own comments). One real
  // consequence, not swept under this: /blog/[slug] article pages matched
  // the OLD check too (their cover photos are unpredictable stock/AI
  // images with no scrim of their own) but do NOT render LightPortraitHero
  // — see this pass's own report for whether that route still looks
  // right without it.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

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
      // Gold-button unification pass: the CTA no longer carries its own
      // data-collapsed copy (and no longer needs its own ref for it) — it's
      // now a real Button component, which doesn't forward refs. It's a DOM
      // descendant of `header` (labHeaderActions is nested inside
      // labHeaderInner is nested inside this element), so
      // HeaderInteractive.module.scss now reads the CTA's collapsed size
      // off the ancestor's own attribute via a plain descendant selector
      // (.labHeader[data-collapsed="true"] .labHeaderCta) instead.
      header!.dataset.collapsed = collapsedRef ? "true" : "false";
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

  // Header-over-light-hero pass: this was `forceCollapsed ? "true" :
  // "false"`, a real per-route hardcode (matching /blog by pathname) that
  // gave the SSR'd markup the right initial value on that one route, to
  // avoid a one-frame flash before the scroll effect above ran. That
  // route check is gone — the appearance on light-hero pages is now owned
  // entirely by HeaderInteractive.module.scss's `body:has([data-light-hero])`
  // rule, which needs no JS and has nothing to flash before. This constant
  // is what's left once the conditional it used to hold is gone: every
  // route's true initial scroll-linked state, always "false" at scroll 0.
  // Kept as a named constant (not inlined below) so this comment has
  // somewhere to live. The CTA button no longer needs its own copy of this
  // (see the scroll effect's own comment above) — only the header element
  // itself sets it now.
  const initialCollapsed = "false";

  return (
    <>
      <header
        className={styles.labHeader}
        ref={headerRef}
        data-lab-header="true"
        data-collapsed={initialCollapsed}
        data-mobile-menu-open={mobileMenuOpen ? "true" : undefined}
      >
        <div className={styles.labHeaderInner}>
          {/* Logo pass: signature + a live "Psicoterapeuta" descriptor,
              both inside one link. No aria-label added here — the SVG's
              own role="img"/aria-label="Dr. Giuseppe Iannone" plus the
              visible descriptor text already compose into a complete,
              non-redundant accessible name ("Dr. Giuseppe Iannone
              Psicoterapeuta") via the standard link-name algorithm;
              adding a second aria-label on the Link would only replace
              that with a hand-written duplicate. */}
          <Link href={homePath(locale)} className={styles.labHeaderWordmark}>
            <SignatureMark className={styles.labHeaderSignature} />
            <span className={styles.labHeaderDescriptor}>Psicoterapeuta</span>
          </Link>

          <nav className={styles.labHeaderNav} aria-label="Menu principale">
            <ul className={styles.labHeaderNavList}>
              {navItems.map((item) => {
                if (item.usesPillarTaxonomy) {
                  return (
                    <li key={item.label}>
                      <HeaderAreaMenu
                        label={item.label}
                        groups={areaTaxonomy}
                        isOpen={openSubmenu === item.label}
                        onOpenChange={(open) => handleSubmenuOpenChange(item.label, open)}
                      />
                    </li>
                  );
                }
                if (item.children) {
                  return (
                    <li key={item.label}>
                      <HeaderNavItemWithSubmenu
                        item={item}
                        locale={locale}
                        isOpen={openSubmenu === item.label}
                        onOpenChange={(open) => handleSubmenuOpenChange(item.label, open)}
                      />
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <Link href={item.href ?? "#"} className={styles.labHeaderNavLink}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.labHeaderActions}>
            <p className={styles.labHeaderLocalePair}>
              <LocaleSwitcher currentLocale={locale} />
            </p>
            <Button
              type="button"
              variant="primary"
              tone="base"
              showArrow={false}
              className={styles.labHeaderCta}
              onClick={() => dialogRef.current?.open()}
            >
              {ctaLabel}
            </Button>
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
        areaTaxonomy={areaTaxonomy}
        locale={locale}
        toggleRef={mobileToggleRef}
        headerRef={headerRef}
      />

      {/* Colocated with the button that triggers it — nothing else on
          the page needs to open it. */}
      <ChannelPickerDialog ref={dialogRef} contactChannels={contactChannels} locale={locale} />
    </>
  );
}
