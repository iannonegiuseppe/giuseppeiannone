"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, type RefObject } from "react";

// Feasibility pass, allowed to fail per its own spec: Locomotive Scroll
// was rejected outright (it virtualizes scroll via transforms, which
// breaks position:sticky/IntersectionObserver/native anchors — the exact
// failure class the project's earlier double-scroll fix eliminated).
// Lenis instead smooths the NATIVE scroll — it drives window.scrollTo()
// under the hood (verified by reading node_modules/lenis/dist/lenis.mjs
// directly, not assumed from docs), so window.scrollY stays authoritative
// and every existing scroll-driven component in this lab (all of which
// read native scrollY via each file's own getScrollContainer() helper)
// should keep working unmodified. This flag is the "leave it behind
// disabled" escape hatch the spec requires if the verification matrix in
// this pass's report doesn't go fully green — flip to false to ship the
// integration inert rather than deleting it.
const LENIS_ENABLED = true;

// A ref, not state: the only consumers (ChannelPickerDialog.tsx,
// MobileMenuOverlay.tsx) call lenisRef.current?.stop()/start() from
// inside their OWN event handlers/effects, never from render output, so
// nothing here needs to trigger a re-render when the instance appears.
// Setting state from inside this effect instead (an earlier draft did)
// tripped the same react-hooks/set-state-in-effect rule this codebase
// already fixed elsewhere via useSyncExternalStore (see RecognitionStage.tsx) —
// that pattern doesn't fit here since useSyncExternalStore's getSnapshot
// must be a pure read, and constructing a Lenis instance is inherently a
// side effect (it attaches listeners immediately). A plain ref sidesteps
// the rule entirely rather than fighting it.
const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

export function useLenisRef(): RefObject<Lenis | null> | null {
  return useContext(LenisContext);
}

// Debounce for the ResizeObserver-triggered resize() below — matches
// Lenis's own internal default (node_modules/lenis/dist/lenis.mjs's own
// Dimensions class debounces its window-resize handler at 250ms), so this
// safeguard fires on the same cadence Lenis already uses for itself rather
// than an arbitrarily different one.
const RESIZE_DEBOUNCE_MS = 250;
// Belt-and-suspenders bounded re-measure schedule after a route change —
// the same three-step delays SignatureBandTuned.tsx already uses for this
// exact class of problem (a single re-measure can land before layout
// genuinely settles), reused rather than inventing a second pattern.
const RESIZE_FOLLOWUP_DELAYS_MS = [300, 1000, 2000];

// Promotion pass: hoisted from a design-lab-page-scoped provider to
// src/app/[locale]/layout.tsx, wrapping Header/{children}/Footer together
// — Header's dialogs (channel picker, mobile menu) need the same Lenis
// instance Header renders under, and Header is a layout-level sibling of
// {children}, not a descendant of any per-page provider. Smooth scrolling
// is therefore site-wide now, not homepage-only; a direct, disclosed
// consequence of promoting Header, not a silent expansion. Lenis is
// deliberately left on its all-default wrapper/content (window /
// document.documentElement) rather than a custom scroll container of our
// own: introducing one would itself create the "second scroll container"
// class of bug every other component here already goes out of its way to
// avoid (see Timeline.tsx's own isScrollable()/getScrollContainer()
// comment).
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  // Plain next/navigation, not @/i18n/navigation's locale-aware hook — this
  // provider also mounts standalone on /design-lab (DesignLabHomepage's
  // own <LenisProvider>), which has no NextIntlClientProvider ancestor;
  // next-intl's usePathname throws there (same class of bug fixed in
  // HeaderInteractive.tsx — see that file's own comment).
  const pathname = usePathname();

  useEffect(() => {
    if (!LENIS_ENABLED) return;

    // Coarse pointers (touch) already get well-tuned native inertial
    // scroll — layering JS smoothing on top of that causes motion
    // discomfort rather than improving it, per spec. prefers-reduced-
    // motion is a full opt-out for the same reason every other
    // scroll-driven effect in this codebase treats it as one — unlike
    // HeaderInteractive.tsx's own scroll-collapse listener (which must
    // keep tracking state under reduced motion, just without an animated
    // transition), THIS effect's entire purpose is motion itself, so
    // there's nothing worth preserving when motion is off.
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarsePointer || reducedMotion) return;

    const instance = new Lenis({
      lerp: 0.1,
      duration: 1.1,
      infinite: false,
      syncTouch: false,
      autoRaf: true,
    });
    lenisRef.current = instance;

    // Real bug, diagnosed and proven live (this pass's own report has the
    // full measurement): Lenis only computes its scroll `limit` at
    // construction and on a genuine `window resize` event
    // (node_modules/lenis/dist/lenis.mjs's own Dimensions class). This
    // provider lives in the root layout and is never unmounted across
    // Next.js client-side route transitions, so the SAME instance
    // persists from whatever page was current when it was constructed —
    // navigating client-side from a shorter page to a taller one left the
    // shorter page's limit in force, capping scroll on the new page far
    // short of its real bottom. Confirmed live: a single synthetic
    // `resize` event alone (nothing else) restored full scroll.
    //
    // Observes document.body, not document.documentElement, as the
    // trigger: body gets min-height:100% plus ordinary block/flex flow
    // from this project's own reset (globals.scss), so its box
    // unconditionally grows with content under standard CSS rules — no
    // browser-specific behaviour required to explain it. documentElement
    // only tracks content because of the root element's special
    // viewport-scrolling treatment (confirmed working in this project's
    // own testing, but not a rule this fix needs to depend on). This is
    // only the TRIGGER for when to re-measure — lenis.resize() itself
    // still reads document.documentElement.scrollHeight internally
    // (Lenis's own default `content` target, untouched here).
    //
    // Debounced at the same 250ms Lenis itself already uses internally,
    // so a burst of intermediate layout ticks during image decode doesn't
    // call resize() on every one of them.
    let debounceId: number | undefined;
    const debouncedResize = () => {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(() => lenisRef.current?.resize(), RESIZE_DEBOUNCE_MS);
    };
    const observer = new ResizeObserver(debouncedResize);
    observer.observe(document.body);

    return () => {
      window.clearTimeout(debounceId);
      observer.disconnect();
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Route-change resize — the direct fix for the bug above: re-measure
  // immediately on every pathname change (including the initial mount,
  // harmlessly redundant with the constructor's own first measurement),
  // plus the same bounded 300/1000/2000ms follow-up schedule
  // SignatureBandTuned.tsx uses for "layout settles later than a single
  // measurement can catch" — belt-and-suspenders alongside the
  // ResizeObserver above, not a replacement for it. No new Lenis
  // instance, no scroll listener — only the existing instance's own
  // public resize() method.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.resize();
    const timeouts = RESIZE_FOLLOWUP_DELAYS_MS.map((ms) =>
      window.setTimeout(() => lenisRef.current?.resize(), ms),
    );
    return () => timeouts.forEach((id) => window.clearTimeout(id));
  }, [pathname]);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
