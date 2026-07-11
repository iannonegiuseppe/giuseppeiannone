"use client";

import Lenis from "lenis";
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

    return () => {
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
