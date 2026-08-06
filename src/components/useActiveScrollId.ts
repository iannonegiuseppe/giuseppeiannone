"use client";

import { useEffect, useState } from "react";
import { useLenisRef } from "@/components/LenisProvider";

// Chi sono timeline pass — extracted verbatim from ScrollTrackingToc.tsx's
// own inline effect (that component's logic and this hook's are now
// byte-identical; ScrollTrackingToc itself was refactored to call this
// rather than keep a duplicate copy — see that file's own comment). The
// timeline's year rail needed the same "which of these DOM ids is
// currently being read" tracking, driven by the same shared Lenis
// instance, but rendering something that isn't a table of contents
// (years/places, not headings) — reusing the TRACKING, not the TOC
// rendering, is the actual overlap between the two.
const LENIS_WAIT_RETRIES = 30;
const LENIS_WAIT_INTERVAL_MS = 100;
const ACTIVE_OFFSET_PX = 120;

export function useActiveScrollId(ids: string[]): string | null {
  const lenisRef = useLenisRef();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    function computeActive() {
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= ACTIVE_OFFSET_PX) {
          current = id;
        }
      }
      setActiveId(current ?? ids[0] ?? null);
    }

    function attach(retriesLeft: number) {
      if (cancelled) return;
      const lenis = lenisRef?.current;
      if (!lenis) {
        if (retriesLeft <= 0) return;
        const timer = setTimeout(() => attach(retriesLeft - 1), LENIS_WAIT_INTERVAL_MS);
        cleanup = () => clearTimeout(timer);
        return;
      }
      computeActive();
      lenis.on("scroll", computeActive);
      cleanup = () => lenis.off("scroll", computeActive);
    }

    attach(LENIS_WAIT_RETRIES);
    return () => cleanup?.();
  }, [ids, lenisRef]);

  return activeId;
}
