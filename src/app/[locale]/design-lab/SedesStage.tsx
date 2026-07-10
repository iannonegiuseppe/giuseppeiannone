"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type * as Leaflet from "leaflet";
import type { SedeAddress, SedeScene } from "./sediData";
import styles from "./design-lab.module.scss";

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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return isDesktopWidth && !reducedMotion;
}

// Same scroll-container detection as Timeline.tsx — see that file's
// comment for the full CSS-spec explanation (the double-vertical-scrollbar
// pass's `overflow-x: hidden` -> `clip` fix). Reused verbatim rather than
// extracted to a shared module, per this file's established duplication
// convention.
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
// .sedesMap[data-map-style="dark"] in design-lab.module.scss).
//
// HONESTY-RULE FLAG: spec's own rule is "default to dark IF street
// legibility at zoom 14 is not worse than voyager." Measured via a
// direct side-by-side at zoom 14 (same tile, both filters applied — see
// the pass's final report / rev2-05-voyager-vs-dark.png): dark_matter +
// pine tint IS worse — street labels and building outlines that read
// clearly on voyager's cream background become low-contrast on the
// near-black dark_matter base even after tinting/brightening. The
// condition for defaulting to dark isn't met, so this stays on
// "voyager" — "dark" is fully built and one line away if the owner
// prefers the mood over the legibility trade-off.
const MAP_STYLE = "voyager" as "voyager" | "dark";

const CARTO_TILE_URL =
  MAP_STYLE === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const CARTO_SUBDOMAINS = "abcd";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>';

type SceneView = { center: Leaflet.LatLngExpression; zoom: number };

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
const ITALY_BOUNDS: [[number, number], [number, number]] = [
  [36.5, 6.6],
  [47.2, 18.6],
];

function computeSceneViews(map: Leaflet.Map, L: typeof Leaflet, scenes: SedeScene[]): SceneView[] {
  return scenes.map((scene) => {
    if (scene.addresses.length === 0) {
      const bounds = L.latLngBounds(ITALY_BOUNDS);
      return { center: bounds.getCenter(), zoom: map.getBoundsZoom(bounds, false, L.point(40, 40)) };
    }
    if (scene.addresses.length === 1) {
      const a = scene.addresses[0]!;
      return { center: [a.lat, a.lng], zoom: 15 };
    }
    const bounds = L.latLngBounds(scene.addresses.map((a): [number, number] => [a.lat, a.lng]));
    return { center: bounds.getCenter(), zoom: map.getBoundsZoom(bounds, false, L.point(40, 40)) };
  });
}

function AddressLines({ addr }: { addr: SedeAddress }) {
  return (
    <>
      {addr.centerName ? <p className={styles.sedesAddressCenterName}>{addr.centerName}</p> : null}
      <p className={styles.sedesAddressLine}>{addr.address}</p>
    </>
  );
}

function LeftColumnText({ kicker, heading, paragraph }: { kicker: string; heading: string; paragraph: string }) {
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

function MobileSlider({ scenes }: { scenes: SedeScene[] }) {
  return (
    <ul className={styles.sedesSlider}>
      {scenes.map((scene) => (
        <li key={scene.id} className={styles.sedesSliderCard}>
          <h3 className={styles.sedesSliderCity}>{scene.city}</h3>
          {scene.addresses.length > 0
            ? scene.addresses.map((addr) => <AddressLines key={addr.address} addr={addr} />)
            : (
                <p className={styles.sedesAddressLine}>{scene.onlineLine}</p>
              )}
        </li>
      ))}
    </ul>
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
  const sticky = useSyncExternalStore(subscribeNever, getStickySnapshot, getStickyServerSnapshot);

  const stageWrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<Leaflet.Map | null>(null);
  const sceneViewsRef = useRef<SceneView[]>([]);
  const markersRef = useRef<{ marker: Leaflet.Marker; sceneIndex: number }[]>([]);
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
      const [L] = await Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]);
      if (cancelled || !mapContainerRef.current) return;

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
        (e as unknown as { tile: HTMLImageElement }).tile.style.display = "none";
      });
      tileLayer.addTo(map);

      markersRef.current = allAddresses.map((addr) => {
        const icon = L.divIcon({
          className: styles.sedesMarkerIcon!,
          html: `<span class="${styles.sedesMarkerDot}"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const marker = L.marker([addr.lat, addr.lng], { icon, keyboard: false, interactive: false }).addTo(map);
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

      sceneViewsRef.current = computeSceneViews(map, L, scenes);

      if (sticky) {
        const initialView = sceneViewsRef.current[0];
        if (initialView) map.setView(initialView.center, initialView.zoom);
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
        const overviewBounds = L.latLngBounds(allAddresses.map((a): [number, number] => [a.lat, a.lng]));
        map.setView(overviewBounds.getCenter(), map.getBoundsZoom(overviewBounds, false, L.point(40, 40)));
      }
    }

    function setMarkerScale(index: number) {
      for (const { marker, sceneIndex } of markersRef.current) {
        const el = marker.getElement();
        el?.classList.toggle(styles.sedesMarkerActive!, sceneIndex === index);
      }
    }

    function flyToScene(index: number) {
      const map = mapRef.current;
      const view = sceneViewsRef.current[index];
      if (!map || !view) return;
      map.stop(); // cancel any in-flight flyTo before starting the next one, per spec
      map.flyTo(view.center, view.zoom, { duration: 1.2 });
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
        const index = Math.min(scenes.length - 1, Math.floor(progress * scenes.length));
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
          <LeftColumnText kicker={kicker} heading={heading} paragraph={paragraph} />
        </div>
        <MobileSlider scenes={scenes} />
      </div>

      <div ref={stageWrapRef} className={styles.sedesDesktopStage}>
        {sticky ? (
          <div ref={trackRef} className={styles.sedesTrack} style={{ "--sedes-scene-count": scenes.length } as React.CSSProperties}>
            <div className={styles.sedesStageInner}>
              <div className={styles.sedesGridWrap}>
                <div className={styles.sedesLeftColumn}>
                  <div>
                    <LeftColumnText kicker={kicker} heading={heading} paragraph={paragraph} />
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
                    <div ref={mapContainerRef} className={styles.sedesMap} data-map-style={MAP_STYLE} />
                  </div>
                  <div className={styles.sedesPanel}>
                    {scenes.map((scene, i) => (
                      <div key={scene.id} className={styles.sedesPanelScene} data-active={i === activeIndex}>
                        <h3 className={styles.sedesPanelCity}>{scene.city}</h3>
                        {scene.addresses.length > 0
                          ? scene.addresses.map((addr) => <AddressLines key={addr.address} addr={addr} />)
                          : (
                              <p className={styles.sedesAddressLine}>{scene.onlineLine}</p>
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
                <LeftColumnText kicker={kicker} heading={heading} paragraph={paragraph} />
              </div>
            </div>
            <div className={styles.sedesStaticScenes}>
              {scenes.map((scene) => (
                <div key={scene.id} className={styles.sedesStaticScene}>
                  <h3 className={styles.sedesPanelCity}>{scene.city}</h3>
                  {scene.addresses.length > 0
                    ? scene.addresses.map((addr) => <AddressLines key={addr.address} addr={addr} />)
                    : (
                        <p className={styles.sedesAddressLine}>{scene.onlineLine}</p>
                      )}
                </div>
              ))}
            </div>
            <div ref={mapContainerRef} className={styles.sedesStaticMap} data-map-style={MAP_STYLE} />
          </div>
        )}
      </div>
    </div>
  );
}
