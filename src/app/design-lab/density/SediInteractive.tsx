"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { LocationEntry } from "@/components/LocationsSection";
import type { LocationsLabels } from "@/components/LocationsInteractive";
import { useLenisRef } from "@/components/LenisProvider";
import { useSediMapContext } from "./SediMapContext";
import styles from "./sediSection.module.scss";

// Forked from src/components/LocationsInteractive.tsx (shared with
// production — see SediBlock.tsx's own comment). Behaviour identical
// (single activeId drives list highlight + map popup/flyTo, same
// group-by-city structure); activeId now comes from SediMapContext
// instead of a local useState, so the photo strip can drive the same
// state. New this fork: a persistent .locationItemArrow affordance on
// every address (not hover-only), and the online entry rendered as a
// real, same-family list item (title + sub-line) instead of a detached
// italic line — replaces .locationsOnlineNote entirely.
//
// Critical rendering rule (unchanged from the original): the map is
// progressive enhancement ONLY — dynamically imported with ssr:false so
// Leaflet (which needs `window`) never runs server-side, and its own
// downstream imports (SediPopupContent -> @/sanity/image -> @/sanity/
// client -> next/headers) never get bundled into a server/SSR chunk
// either, which is what a static top-level import would do.
const SediMap = dynamic(() => import("./SediMap").then((m) => m.SediMap), {
  ssr: false,
  loading: () => null,
});
function groupByCity(locations: LocationEntry[]): { city: string; items: LocationEntry[] }[] {
  const groups: { city: string; items: LocationEntry[] }[] = [];
  for (const loc of locations) {
    const existing = groups.find((g) => g.city === loc.city);
    if (existing) {
      existing.items.push(loc);
    } else {
      groups.push({ city: loc.city, items: [loc] });
    }
  }
  return groups;
}

export function SediInteractive({
  locations,
  onlineCity,
  onlineSubLine,
  labels,
}: {
  locations: LocationEntry[];
  onlineCity?: string;
  onlineSubLine?: string;
  labels: LocationsLabels;
}) {
  const { activeId, scrollRequested, selectLocation } = useSediMapContext();
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lenisRef = useLenisRef();
  // Correction pass, items 2b/2c: the map only ever reacts to
  // mapActiveId, not the real activeId directly — decoupled so the
  // scroll can finish BEFORE SediMap's own (untouched) activeId-effect
  // fires its flyTo + opens the popup. The list's own data-active
  // highlight below still reads the real activeId, so a click still
  // feels instant there; only the map's reaction — the piece that was
  // visually competing with the scroll — waits.
  const [mapActiveId, setMapActiveId] = useState<string | null>(null);
  // Correction pass, item 7: map height now matches the list's own
  // rendered height at lg+ (the breakpoint where .locationsGrid actually
  // becomes two columns — the brief said "md+", but this codebase's own
  // two-column switch has always been lg/1024px; matching that existing
  // breakpoint rather than introducing a second, different one). Driven
  // by a ResizeObserver (not a one-time measurement) so it survives a
  // fifth address, a longer label, or a font-load reflow — never a
  // hardcoded pixel value.
  const [listHeight, setListHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setListHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const groups = groupByCity(locations);

  // Scrolls the map into view whenever activeId changes, regardless of
  // whether the click originated from this list or from the photo strip
  // below — a single source of truth for the "bring the map into view"
  // side effect, rather than duplicating it at every call site.
  //
  // Correction pass, items 2b/2c: was a plain native scrollIntoView —
  // measured to be the actual cause of both the "doesn't always happen"
  // and "abrupt" symptoms. This page's own scroll is owned by Lenis
  // (LenisProvider, wrapping the whole site) — a native scrollIntoView
  // call fights it: Lenis intercepts and smooths real scroll input, so a
  // second, independent scroll driver racing against it produces
  // inconsistent results depending on timing, and native "smooth" is the
  // browser's own easing, not Lenis's, so even a "successful" native
  // scroll reads as a visually different, abrupt motion next to
  // everything else on this page. Fixed by driving the same scroll
  // through the existing Lenis instance instead (useLenisRef(), already
  // used this way by HeroCta.tsx — same pattern, not a new one).
  //
  // Sequence chosen: scroll first, then (only once it's actually
  // finished) let SediMap react to the new activeId — its own flyTo (0.8s)
  // and popup-open were otherwise starting at roughly the same moment as
  // the page scroll, reading as two competing animations. mapActiveId
  // (buffered, see above) is what makes this ordering possible without
  // touching SediMap's own flyTo/popup code at all.
  //
  // scrollRequested (SediMapContext) is what keeps a pin clicked directly
  // ON the map reacting exactly as immediately as it already did: the map
  // is already in view in that case, there's nothing to scroll to, and
  // this pass's own "do not change map behaviour" constraint means a pin
  // click's own reaction must not gain a new delay. Only the list and the
  // strip (both potentially off-screen from the map) request a scroll.
  //
  // Numbers chosen by eye, checked against the real render at all three
  // widths: duration 0.9s (a bit snappier than LenisProvider's own 1.1s
  // wheel-scroll default — this is a short, deliberate jump, not
  // momentum-scrolling), easeOutCubic (1 - (1-t)^3, a standard, gentle
  // deceleration matching Lenis's own general feel), offset -96px (the
  // map's own top edge lands 96px below the viewport top once scrolled —
  // comfortably clear of the sticky header at every width, not jammed
  // against it).
  useEffect(() => {
    const target = mapWrapRef.current;
    if (!target) return;

    if (!activeId || !scrollRequested) {
      // Closing, or a pin-originated change — sync immediately, no scroll.
      setMapActiveId(activeId);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      // No easing, no duration — jump instantly. LenisProvider itself
      // never instantiates under reduced motion, so there is no Lenis
      // instance to ask here either way; this is the one place a plain
      // native call is correct, not a fallback for a bug.
      target.scrollIntoView({ behavior: "auto", block: "start" });
      setMapActiveId(activeId);
      return;
    }

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    if (lenisRef?.current) {
      lenisRef.current.scrollTo(target, {
        offset: -96,
        duration: 0.9,
        easing: easeOutCubic,
        onComplete: () => setMapActiveId(activeId),
      });
    } else {
      // Lenis deliberately does not run on coarse-pointer/touch (see
      // LenisProvider's own comment) — there is no second instance to
      // reach for there, so this is the same native-smooth-scroll
      // fallback HeroCta.tsx already uses for the identical situation,
      // not a new pattern. No onComplete callback exists for the native
      // API, so mapActiveId is set after a fixed delay approximating a
      // typical native smooth-scroll duration for this distance.
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      const timeout = setTimeout(() => setMapActiveId(activeId), 700);
      return () => clearTimeout(timeout);
    }
  }, [activeId, scrollRequested, lenisRef]);

  return (
    <div className={styles.locationsGrid}>
      <ul ref={listRef} className={styles.locationsList} role="list">
        {groups.map((group) => (
          <li key={group.city} className={styles.locationsCityGroup}>
            <p className={styles.locationsCityLabel}>{group.city}</p>
            <ul role="list">
              {group.items.map((loc) => {
                const accessibleName = loc.district
                  ? `${loc.address}, ${loc.district}`
                  : `${loc.address}, ${loc.city}`;

                return (
                  <li key={loc.id}>
                    <button
                      type="button"
                      className={styles.locationItem}
                      data-active={loc.id === activeId}
                      aria-label={accessibleName}
                      onClick={() => selectLocation(loc.id)}
                    >
                      <span className={styles.locationItemText}>
                        <span className={styles.locationItemTitle}>{loc.address}</span>
                        <span className={styles.locationItemSub}>{loc.district ?? ""}</span>
                      </span>
                      <span className={styles.locationItemArrow} aria-hidden="true">
                        <span className={styles.arrowShaft} />
                        <span className={styles.arrowHead} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
        {/* Online entry: same visual family as an address (title + sub-
            line), no button, no arrow, no pin — a plain block, not
            interactive, per this pass's own "no map-pin behaviour" spec. */}
        {onlineCity ? (
          <li className={styles.locationsCityGroup}>
            <div className={styles.locationsOnlineItem}>
              <span className={styles.locationItemTitle}>{onlineCity}</span>
              {onlineSubLine ? <span className={styles.locationItemSub}>{onlineSubLine}</span> : null}
            </div>
          </li>
        ) : null}
      </ul>
      <div
        ref={mapWrapRef}
        className={styles.locationsMapWrap}
        style={listHeight ? ({ "--list-height": `${listHeight}px` } as CSSProperties) : undefined}
      >
        <SediMap
          locations={locations}
          activeId={mapActiveId}
          onActiveChange={(id) => selectLocation(id, { scroll: false })}
          labels={labels}
          listHeight={listHeight}
        />
      </div>
    </div>
  );
}
