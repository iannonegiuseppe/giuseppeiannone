"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type * as Leaflet from "leaflet";
import styles from "./SedesSection.module.scss";

// CMS-wiring pass: replaces the types formerly in the now-retired
// sediData.ts — id is the Sanity document's own _id (SedesSection.tsx maps
// the raw sede[] query result onto this shape), used only as a React key
// here, not looked up anywhere by value.
export type SedeAddress = {
  centerName?: string;
  address: string;
  lat: number;
  lng: number;
};

export type SedeScene = {
  id: string;
  city: string;
  addresses: SedeAddress[];
  onlineLine?: string;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// Same useSyncExternalStore-with-a-no-op-subscribe pattern as
// HeroMedia.tsx: a one-time, post-hydration decision (reduced-motion is a
// full opt-out per spec, not something that should hot-swap layouts if
// the OS setting changes mid-visit), read without triggering the
// set-state-in-effect anti-pattern a plain useState+useEffect pair would.
// `false` (static layout) is both the server snapshot and the safe
// default while un-hydrated — matches what SSR always renders.
function subscribeNever() {
  return () => {};
}

function getStickyServerSnapshot() {
  return false;
}

function getStickySnapshot() {
  // Below lg (1024px), the mobile slider is the only visible layout
  // regardless of this value (.sedesDesktopStage is display:none there) —
  // deciding `false` here too keeps the sticky branch's DOM (track,
  // stage, panel, map container) from ever mounting at those widths,
  // rather than mounting hidden.
  const isDesktopWidth = window.matchMedia("(min-width: 64rem)").matches;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  return isDesktopWidth && !reducedMotion;
}

// Same scroll-container detection as Timeline.tsx — see that file's
// comment for the full CSS-spec explanation (the double-vertical-scrollbar
// pass's `overflow-x: hidden` -> `clip` fix). Reused verbatim rather than
// extracted to a shared module, per this file's established duplication
// convention.
function isScrollable(el: HTMLElement): boolean {
  const overflowY = getComputedStyle(el).overflowY;
  return (
    (overflowY === "auto" || overflowY === "scroll") &&
    el.scrollHeight > el.clientHeight + 1
  );
}

function getScrollContainer(): HTMLElement | (Window & typeof globalThis) {
  const { body, documentElement } = document;
  if (isScrollable(body)) return body;
  if (isScrollable(documentElement)) return documentElement;
  return window;
}

function getScrollTop(
  container: HTMLElement | (Window & typeof globalThis),
): number {
  return container instanceof Window ? container.scrollY : container.scrollTop;
}

// Revision round 1, item 7b: switched from CARTO's "light_all" (Positron)
// basemap to "voyager" — visibly more terrain/street texture and color,
// per spec ("the current basemap reads too white"). Tile filter itself
// lives in CSS (.sedesMap[data-map-style] :global(.leaflet-tile-pane)) —
// see the pass's final report for the tuned/confirmed values and the
// light_all-vs-voyager screenshot comparison.
//
// Revision round 2, item 5: dark_matter + pine-tint prototype, behind
// this ONE constant so the owner can pick — change MAP_STYLE to
// "voyager" or "dark" and both the tile source and the CSS filter follow
// (the filter lives in CSS, keyed off data-map-style, not here — see
// .sedesMap[data-map-style="dark"] in sectionsShared.module.scss).
//
// Polish pass round 2, item 1: the previous pass activated "dark" per an
// explicit owner call. Round 3 reverses that call: dark_matter + pine
// tint read as murky "military khaki," the wrong mood — back to warm
// "voyager" with a gentle pine-leaning tint (see the voyager filter rule
// in SedesSection.module.scss for the retuned values), with the PANEL
// now made dark/accent-colored instead so it's the element that stands
// out against the light map, rather than the map being dark and the
// panel light.
const MAP_STYLE = "voyager" as "voyager" | "dark";

const CARTO_TILE_URL =
  MAP_STYLE === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const CARTO_SUBDOMAINS = "abcd";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>';

type SceneBounds = {
  bounds: Leaflet.LatLngBounds;
  maxZoom?: number;
  minimalPadding?: boolean;
};

// Bounds-derived zoom for every scene (not a fixed "~14" for every scene,
// per spec's own suggestion) — HONESTY-RULE ADAPTATION: Milano's two real
// geocoded addresses are ~5.5km apart (via Buonarroti in central Milano,
// Piazza della Trivulziana in Bicocca), so a fixed zoom 14 would crop one
// marker out of frame, contradicting the spec's own "Milano frames both
// its markers" requirement for that same zoom value. Extended the exact
// technique the spec already prescribes for scene 04 (fitBounds-derived
// center/zoom, precomputed) to every multi-marker scene instead, computed
// once when the map initializes — not a new technique, not recomputed
// per scroll frame.
// Revision round 1, item 7c: the "online" scene (zero addresses of its
// own) now flies out to the whole Italian peninsula instead of just
// fitting the 5 studio markers — precomputed bounds, per spec's exact
// values, not derived from allAddresses (which would keep shrinking this
// back to a tight marker cluster). The markers stay on the map, just
// visible as a small cluster in the north at this zoomed-out view.
//
// Polish pass round 2, item 3: tightened to the spec's own suggested
// edge-to-edge values (was [36.5,6.6]-[47.2,18.6], nearly identical) —
// the "half of Europe" symptom traced back to panel PADDING forcing an
// extra zoom-out to fit this same box within a much-shrunken visible
// area, not the bounds themselves (see getScenePadding's `minimal` param
// below), so this tightening alone is a small assist, not the real fix.
const ITALY_BOUNDS: [[number, number], [number, number]] = [
  [36.6, 6.7],
  [47.1, 18.5],
];

// Polish pass, item 2: this used to precompute a plain center+zoom per
// scene via getBoundsZoom's SYMMETRIC 40x40 padding, then call flyTo —
// which fit every marker to the map's raw geometric center, ignoring that
// .sedesPanel visually occupies the bottom-left corner. That's exactly
// why Milano (a wide 2-marker bounds) ended up reading as "top-right,
// off-center": the true geometric center it flew to sat partly behind/
// near the panel, and the visible portion of that framing read as
// top-right within the CLEAR area. Fix: stop precomputing center/zoom
// here entirely, hand raw per-scene bounds to flyToScene instead, and let
// Leaflet's own flyToBounds (fitBounds's animated sibling) do the
// asymmetric-padding math it already has built in — see flyToScene's own
// comment for the corner-padding measurement.
function computeSceneBounds(
  L: typeof Leaflet,
  scenes: SedeScene[],
): SceneBounds[] {
  return scenes.map((scene) => {
    if (scene.addresses.length === 0) {
      // Polish pass round 2, item 3: minimalPadding — see getScenePadding.
      return { bounds: L.latLngBounds(ITALY_BOUNDS), minimalPadding: true };
    }
    if (scene.addresses.length === 1) {
      const a = scene.addresses[0]!;
      // Degenerate (zero-area) bounds: a single point. flyToBounds would
      // otherwise zoom in to the map's own max zoom for a zero-size
      // bounds — capped at 15 (this scene's previous fixed single-marker
      // zoom) so it doesn't over-tighten.
      return {
        bounds: L.latLngBounds([
          [a.lat, a.lng],
          [a.lat, a.lng],
        ]),
        maxZoom: 15,
      };
    }
    return {
      bounds: L.latLngBounds(
        scene.addresses.map((a): [number, number] => [a.lat, a.lng]),
      ),
    };
  });
}

function AddressLines({ addr }: { addr: SedeAddress }) {
  return (
    <>
      {addr.centerName ? (
        <p className={styles.sedesAddressCenterName}>{addr.centerName}</p>
      ) : null}
      <p className={styles.sedesAddressLine}>{addr.address}</p>
    </>
  );
}

// Polish pass, item 3: the redesigned scene panel gets its own typography
// (14px street vs. AddressLines' shared 15px, plus the 4px name/street +
// 16px between-address rhythm the spec asks for) — scoped to a dedicated
// component/classes rather than changing AddressLines itself, since that
// component is also reused by the mobile slider and the reduced-motion
// static fallback, neither of which this pass's spec asks to touch (QA
// item 5 requires the static fallback stay unchanged).
function PanelAddressLines({ addr }: { addr: SedeAddress }) {
  return (
    <div className={styles.sedesPanelAddress}>
      {addr.centerName ? (
        <p className={styles.sedesPanelAddressCenterName}>{addr.centerName}</p>
      ) : null}
      <p className={styles.sedesPanelAddressStreet}>{addr.address}</p>
    </div>
  );
}

function LeftColumnText({
  kicker,
  heading,
  paragraph,
}: {
  kicker: string;
  heading: string;
  paragraph: string;
}) {
  return (
    <>
      <p className={styles.sedesKicker}>
        <span className={styles.sedesKickerRule} aria-hidden="true" />
        {kicker}
      </p>
      <h2 className={styles.sedesHeading}>{heading}</h2>
      <p className={styles.sedesParagraph}>{paragraph}</p>
    </>
  );
}

// Polish pass, item 4 / round 2, item 5: a filling progress bar + "n /
// total" counter tracking the snapped card. No `scrollsnapchange` event
// (still experimental, unsupported in several evergreen browsers as of
// this pass) — instead a passive scroll listener finds whichever card's
// own center sits closest to the container's center (the same reasoning
// scroll-snap itself settles on, for the counter) AND tracks a separate
// continuous scrollLeft ratio (for the bar's fill width, so it visibly
// moves WHILE scrolling between cards, not just at each snap point) — both
// recomputed via rAF so neither runs more than once per frame.
function MobileSlider({ scenes }: { scenes: SedeScene[] }) {
  const containerRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    function computeActive() {
      rafId = null;
      const el = containerRef.current;
      if (!el) return;
      const containerCenter =
        el.getBoundingClientRect().left + el.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      Array.from(el.children).forEach((child, index) => {
        const rect = (child as HTMLElement).getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - containerCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActiveIndex(closestIndex);

      const maxScroll = el.scrollWidth - el.clientWidth;
      setProgress(maxScroll > 0 ? clamp01(el.scrollLeft / maxScroll) : 0);
    }

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(computeActive);
    }

    computeActive();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <ul ref={containerRef} className={styles.sedesSlider}>
        {scenes.map((scene) => (
          <li key={scene.id} className={styles.sedesSliderCard}>
            <h3 className={styles.sedesSliderCity}>{scene.city}</h3>
            {scene.addresses.length > 0 ? (
              scene.addresses.map((addr) => (
                <AddressLines key={addr.address} addr={addr} />
              ))
            ) : (
              <p className={styles.sedesAddressLine}>{scene.onlineLine}</p>
            )}
          </li>
        ))}
      </ul>
      <div className={styles.sedesSliderMeta} aria-hidden="true">
        <div className={styles.sedesSliderProgress}>
          <div
            className={styles.sedesSliderProgressFill}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className={styles.sedesSliderCounter}>
          {activeIndex + 1} / {scenes.length}
        </p>
      </div>
    </>
  );
}

export function SedesStage({
  kicker,
  heading,
  paragraph,
  scenes,
}: {
  kicker: string;
  heading: string;
  paragraph: string;
  scenes: SedeScene[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Reduced motion is a full opt-out per spec — the sticky scroll scenario
  // simply never runs. `false` (static layout) is both the server
  // snapshot and the default while un-hydrated, matching what SSR always
  // renders, so this settling into `true` post-hydration is a normal
  // progressive-enhancement update, not a hydration mismatch.
  const sticky = useSyncExternalStore(
    subscribeNever,
    getStickySnapshot,
    getStickyServerSnapshot,
  );

  const stageWrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<Leaflet.Map | null>(null);
  // getScenePadding/flyToScene (below) are declared as siblings of
  // initMap, not nested inside it, so the dynamically-imported `L` module
  // (only available inside initMap's own async scope) needs to be stashed
  // somewhere they can reach it too — same lifetime/cleanup rules as
  // mapRef itself.
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const sceneBoundsRef = useRef<SceneBounds[]>([]);
  const markersRef = useRef<{ marker: Leaflet.Marker; sceneIndex: number }[]>(
    [],
  );
  const activeIndexRef = useRef(0);

  const allAddresses = scenes.flatMap((s) => s.addresses);

  // Lazy-load Leaflet + tiles only once the stage approaches the
  // viewport, desktop only — mirrors MediaBand.tsx's discipline. This
  // component's own DOM is display:none below lg (1024px, per spec's
  // tablet note), so skip entirely rather than run map/observer work
  // behind a hidden subtree, same convention as Timeline.tsx.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 64rem)").matches) return;

    const target = stageWrapRef.current;
    if (!target) return;

    let cancelled = false;
    let cleanupScroll: (() => void) | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          void initMap();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(target);

    async function initMap() {
      const [L] = await Promise.all([
        import("leaflet"),
        import("leaflet/dist/leaflet.css"),
      ]);
      if (cancelled || !mapContainerRef.current) return;
      leafletRef.current = L;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        keyboard: false,
        doubleClickZoom: false,
        boxZoom: false,
        // Narrated scene, not an explorable widget — every interaction
        // vector is disabled, per spec's explicit critical warning about
        // wheel-zoom fighting the page's own scroll.
      });
      mapRef.current = map;

      const tileLayer = L.tileLayer(CARTO_TILE_URL, {
        subdomains: CARTO_SUBDOMAINS,
        attribution: CARTO_ATTRIBUTION,
        maxZoom: 20,
      });
      // Fallback: a tile that fails to load (offline/adblock) is hidden
      // rather than left as a broken-image glyph, so the container's own
      // --color-greige background (set in CSS) shows through cleanly —
      // scene panels stay fully functional regardless, per spec.
      tileLayer.on("tileerror", (e) => {
        (e as unknown as { tile: HTMLImageElement }).tile.style.display =
          "none";
      });
      tileLayer.addTo(map);

      markersRef.current = allAddresses.map((addr) => {
        const icon = L.divIcon({
          className: styles.sedesMarkerIcon!,
          html: `<span class="${styles.sedesMarkerDot}"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const marker = L.marker([addr.lat, addr.lng], {
          icon,
          keyboard: false,
          interactive: false,
        }).addTo(map);
        const sceneIndex = scenes.findIndex((s) => s.addresses.includes(addr));
        return { marker, sceneIndex };
      });

      // Attribution links are real <a> elements — this whole stage is
      // aria-hidden, so they must not be reachable by keyboard either,
      // per spec's "no focusable elements inside the aria-hidden stage."
      // Leaflet populates the attribution control's DOM asynchronously
      // (after its own internal layout pass, not synchronously within
      // tileLayer.addTo) — a plain synchronous querySelectorAll here
      // reliably found zero links in testing; requestAnimationFrame
      // waits for that pass to land first.
      requestAnimationFrame(() => {
        mapContainerRef.current
          ?.querySelectorAll("a")
          .forEach((a) => a.setAttribute("tabindex", "-1"));
      });

      sceneBoundsRef.current = computeSceneBounds(L, scenes);

      if (sticky) {
        // Polish pass, item 2: instant (non-animated) equivalent of
        // flyToScene below, for the very first paint — fitBounds is
        // flyToBounds's non-animated sibling, same padding math.
        const initial = sceneBoundsRef.current[0];
        const initialPadding = getScenePadding();
        if (initial && initialPadding) {
          map.fitBounds(initial.bounds, {
            ...initialPadding,
            maxZoom: initial.maxZoom,
            animate: false,
          });
        }
        setMarkerScale(0);
        cleanupScroll = attachScrollDriving(map);
      } else {
        // Reduced-motion / static branch: ONE static view containing ALL
        // markers. HONESTY-RULE CATCH (item 7c): this used to reuse the
        // "online" scene's own bounds-derived view for that overview,
        // since it had zero addresses of its own — but item 7c now
        // points that same scene's view at the whole Italian peninsula,
        // not a marker fit, which would have silently zoomed this
        // unrelated reduced-motion overview out to peninsula-scale too
        // (markers barely visible) even though nothing in item 7c asks
        // for that. Computed independently here instead, straight from
        // allAddresses, exactly as the overview worked before 7c.
        const overviewBounds = L.latLngBounds(
          allAddresses.map((a): [number, number] => [a.lat, a.lng]),
        );
        map.setView(
          overviewBounds.getCenter(),
          map.getBoundsZoom(overviewBounds, false, L.point(40, 40)),
        );
      }
    }

    function setMarkerScale(index: number) {
      for (const { marker, sceneIndex } of markersRef.current) {
        const el = marker.getElement();
        el?.classList.toggle(styles.sedesMarkerActive!, sceneIndex === index);
      }
    }

    // Polish pass, item 2: measures the ACTUAL rendered panel against the
    // ACTUAL rendered map container (both live in the same .sedesMapZone,
    // so a viewport-space rect comparison is valid without needing their
    // shared ancestor's own coordinates) to reserve the exact bottom-left
    // rectangle the panel occupies, plus the spec's 24px breathing room.
    // Leaflet's fitBounds/flyToBounds only exposes TWO corner-padding
    // options — paddingTopLeft (x = left inset, y = top inset) and
    // paddingBottomRight (x = right inset, y = bottom inset) — there is no
    // literal "paddingBottomLeft" option; reserving the bottom-LEFT
    // rectangle the spec asks for means combining paddingTopLeft's x (left
    // inset) with paddingBottomRight's y (bottom inset). A 40px floor
    // matches this file's own pre-existing top/right framing padding, so
    // markers still keep breathing room on the sides the panel doesn't
    // touch. Recomputed on every call (two getBoundingClientRect reads)
    // rather than cached, so a window resize between scenes can never
    // leave this stale.
    // Polish pass round 2, item 3: `minimal` skips the panel-footprint
    // reservation entirely, using just the 40px framing floor on every
    // side. The Italian-peninsula scene's real bounds are already close
    // to this map's own aspect ratio — reserving the panel's full ~400px
    // left footprint (needed for the OTHER scenes' tight single-city
    // fits) forces fitBounds to zoom out much further to still fit that
    // same box in a visible area shrunk by a third, which is exactly what
    // dragged France/the Balkans/Tunisia into frame. This scene has no
    // per-scene marker to protect from the panel's occlusion (QA honesty-
    // rule item 7: the Online panel hides no markers, it just sits over
    // open sea/the peninsula's own southern tip), so a correct, tight
    // Italy frame is prioritized over reserving room for a panel that
    // isn't hiding anything scene-specific here.
    function getScenePadding(minimal = false): {
      paddingTopLeft: Leaflet.Point;
      paddingBottomRight: Leaflet.Point;
    } | null {
      const L = leafletRef.current;
      const mapRect = mapContainerRef.current?.getBoundingClientRect();
      if (!L || !mapRect) return null;
      if (minimal) {
        return {
          paddingTopLeft: L.point(40, 40),
          paddingBottomRight: L.point(40, 40),
        };
      }
      const panelRect = panelRef.current?.getBoundingClientRect();
      if (!panelRect) return null;
      const leftPad = Math.max(40, panelRect.right - mapRect.left + 24);
      const bottomPad = Math.max(40, mapRect.bottom - panelRect.top + 24);
      return {
        paddingTopLeft: L.point(leftPad, 40),
        paddingBottomRight: L.point(40, bottomPad),
      };
    }

    // Polish pass round 2, item 3 (root cause, found after the padding
    // reduction above turned out NOT to be enough): the real problem is
    // an aspect-ratio mismatch, not padding. Italy's bounds are tall/
    // narrow (much more north-south extent than east-west); this
    // section's map viewport is wide/landscape. fitBounds/flyToBounds
    // always pick whichever of the two axis zooms is MORE conservative so
    // BOTH width and height fit — since Italy's height needs a looser
    // zoom than its width does (relative to this viewport's own shape),
    // the HEIGHT constraint was winning and forcing a zoom far looser
    // than the width alone needs, dragging Northern Europe/the Balkans
    // into frame regardless of padding. Fitting by WIDTH only (ignoring
    // the height constraint) fixes this directly — some north/south
    // cropping is possible (the Alps' or Sicily's very tip), which the
    // spec's own honesty-rule item 7 explicitly accepts: "prefer correct
    // Italy framing" over fighting this for a scene with no per-scene
    // marker to protect from cropping.
    function widthConstrainedZoom(
      map: Leaflet.Map,
      bounds: Leaflet.LatLngBounds,
      availableWidthPx: number,
    ): number {
      const p0SW = map.project(bounds.getSouthWest(), 0);
      const p0NE = map.project(bounds.getNorthEast(), 0);
      const widthAtZoom0 = Math.abs(p0NE.x - p0SW.x);
      if (widthAtZoom0 <= 0) return map.getZoom();
      return Math.log2(availableWidthPx / widthAtZoom0);
    }

    function flyToScene(index: number) {
      const map = mapRef.current;
      const scene = sceneBoundsRef.current[index];
      const padding = getScenePadding(scene?.minimalPadding);
      const mapRect = mapContainerRef.current?.getBoundingClientRect();
      if (!map || !scene || !padding || !mapRect) return;
      map.stop(); // cancel any in-flight flyTo before starting the next one, per spec
      if (scene.minimalPadding) {
        const availableWidth =
          mapRect.width -
          padding.paddingTopLeft.x -
          padding.paddingBottomRight.x;
        const zoom = Math.min(
          scene.maxZoom ?? Infinity,
          widthConstrainedZoom(map, scene.bounds, availableWidth),
        );
        // A width-fit zoom on Italy's tall shape still crops top/bottom
        // (the visible vertical window is narrower than Italy's full
        // north-south extent) — geometric center would crop evenly, which
        // put the studio marker cluster (Milano, in the north) right on
        // the cropped top edge. Biased north per spec's own alternate
        // suggestion ("shift center upward instead") so the markers stay
        // comfortably in frame; the deep south (Sicily's southern coast)
        // absorbs the extra crop instead — an acceptable trade, since the
        // markers are the more meaningful content here.
        const sw = scene.bounds.getSouthWest();
        const ne = scene.bounds.getNorthEast();
        const biasedCenter = {
          lat: ne.lat - (ne.lat - sw.lat) * 0.35,
          lng: scene.bounds.getCenter().lng,
        };
        map.flyTo(biasedCenter, zoom, { duration: 1.2 });
      } else {
        map.flyToBounds(scene.bounds, {
          ...padding,
          maxZoom: scene.maxZoom,
          duration: 1.2,
        });
      }
      setMarkerScale(index);
    }

    function attachScrollDriving(map: Leaflet.Map) {
      const scrollContainer = getScrollContainer();
      let trackTop = 0;
      let trackHeight = 0;

      function measure() {
        const track = trackRef.current;
        if (!track) return;
        const scrollTop = getScrollTop(scrollContainer);
        const rect = track.getBoundingClientRect();
        trackTop = rect.top + scrollTop;
        trackHeight = rect.height;
      }
      measure();

      let rafId: number | null = null;
      function update() {
        rafId = null;
        const scrollTop = getScrollTop(scrollContainer);
        const pinnedRange = Math.max(1, trackHeight - window.innerHeight);
        const progress = clamp01((scrollTop - trackTop) / pinnedRange);
        const index = Math.min(
          scenes.length - 1,
          Math.floor(progress * scenes.length),
        );
        if (index !== activeIndexRef.current) {
          activeIndexRef.current = index;
          setActiveIndex(index);
          flyToScene(index);
        }
      }

      function onScroll() {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(update);
      }
      function onResize() {
        map.invalidateSize();
        measure();
        update();
      }

      scrollContainer.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);

      return () => {
        scrollContainer.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      cleanupScroll?.();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // `scenes`/`allAddresses` are a static module-level array passed down
    // unchanged (see sediData.ts) — only `sticky` ever actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sticky]);

  return (
    <div aria-hidden="true">
      <div className={styles.sedesMobile}>
        <div className={styles.sedesMobileHeader}>
          <LeftColumnText
            kicker={kicker}
            heading={heading}
            paragraph={paragraph}
          />
        </div>
        <MobileSlider scenes={scenes} />
      </div>

      <div ref={stageWrapRef} className={styles.sedesDesktopStage}>
        {sticky ? (
          <div
            ref={trackRef}
            className={styles.sedesTrack}
            style={
              { "--sedes-scene-count": scenes.length } as React.CSSProperties
            }
          >
            <div className={styles.sedesStageInner}>
              <div className={styles.sedesGridWrap}>
                <div className={styles.sedesLeftColumn}>
                  <div>
                    <LeftColumnText
                      kicker={kicker}
                      heading={heading}
                      paragraph={paragraph}
                    />
                  </div>
                  <div className={styles.sedesIndicator}>
                    <span className={styles.sedesIndicatorCurrent}>
                      {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.sedesIndicatorTotal}>
                      {" "}
                      — {String(scenes.length).padStart(2, "0")}
                    </span>
                    <div className={styles.sedesIndicatorTicks}>
                      {scenes.map((scene, i) => (
                        <span
                          key={scene.id}
                          className={styles.sedesIndicatorTick}
                          data-filled={i <= activeIndex}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.sedesMapZone}>
                  <div className={styles.sedesMapOuter}>
                    <div
                      ref={mapContainerRef}
                      className={styles.sedesMap}
                      data-map-style={MAP_STYLE}
                    />
                  </div>
                  <div ref={panelRef} className={styles.sedesPanel}>
                    {scenes.map((scene, i) => (
                      <div
                        key={scene.id}
                        className={styles.sedesPanelScene}
                        data-active={i === activeIndex}
                      >
                        <h3 className={styles.sedesPanelSceneCity}>
                          {scene.city}
                        </h3>
                        {scene.addresses.length > 0 ? (
                          scene.addresses.map((addr) => (
                            <PanelAddressLines key={addr.address} addr={addr} />
                          ))
                        ) : (
                          <p className={styles.sedesPanelOnlineLine}>
                            {scene.onlineLine}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.sedesStaticLayout}>
            <div className={styles.sedesLeftColumn}>
              <div>
                <LeftColumnText
                  kicker={kicker}
                  heading={heading}
                  paragraph={paragraph}
                />
              </div>
            </div>
            <div className={styles.sedesStaticScenes}>
              {scenes.map((scene) => (
                <div key={scene.id} className={styles.sedesStaticScene}>
                  <h3 className={styles.sedesPanelCity}>{scene.city}</h3>
                  {scene.addresses.length > 0 ? (
                    scene.addresses.map((addr) => (
                      <AddressLines key={addr.address} addr={addr} />
                    ))
                  ) : (
                    <p className={styles.sedesAddressLine}>
                      {scene.onlineLine}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div
              ref={mapContainerRef}
              className={styles.sedesStaticMap}
              data-map-style={MAP_STYLE}
            />
          </div>
        )}
      </div>
    </div>
  );
}
