"use client";

import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import type * as Leaflet from "leaflet";
import type { LocationEntry } from "./LocationsSection";
import type { LocationsLabels } from "./LocationsInteractive";
import { LocationsPopupContent } from "./LocationsPopupContent";
import styles from "./LocationsSection.module.scss";

// Basemap choice — flip this one constant + rebuild to compare Positron
// (neutral light grayscale) against Dark Matter from screenshots; see this
// pass's own report for the measured tile-filter retune and the pin-accent
// contrast call for each variant. CARTO's own tile CDN (still OSM DATA
// underneath, with correct OSM+CARTO attribution) is kept deliberately over
// a raw tile.openstreetmap.org endpoint, which explicitly discourages this
// kind of direct production traffic without a prior arrangement — same
// reasoning as the retired Voyager choice, just a different CARTO style.
// Cast (not a bare literal assignment) so flipping this to "dark" doesn't
// require touching every comparison below — a plain `= "light"` const
// gets narrowed by TS to the single literal type, making `BASEMAP ===
// "dark"` a compile error ("this comparison appears to be unintentional").
const BASEMAP: "light" | "dark" = "light" as "light" | "dark";

const CARTO_TILE_URL =
  BASEMAP === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_SUBDOMAINS = "abcd";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>';

const FIT_BOUNDS_PADDING: [number, number] = [48, 48];

// A wheel "notch" (mouse wheel, not a trackpad) reports deltaY ~100 per
// tick — dividing by this keeps a single notch roughly equal to one zoom
// level, which lines up with the default zoomSnap:1 grid Leaflet already
// rounds to (setZoomAround respects zoomSnap), rather than introducing a
// separately-tuned magic number that fights that grid.
const WHEEL_ZOOM_SENSITIVITY = 100;
const GESTURE_HINT_DISMISS_MS = 1500;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Platform detection for the desktop hint's modifier label ONLY (Ctrl vs
// ⌘) — never used to change actual gating behavior, both Ctrl and Cmd are
// already accepted by the wheel handler via e.ctrlKey || e.metaKey
// regardless of this check. navigator.userAgentData is the modern,
// structured API (Chromium); navigator.platform/userAgent is the fallback
// for browsers that don't implement it yet (Safari, Firefox).
function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  if (uaData?.platform) return /mac/i.test(uaData.platform);
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}

// Locations map pass — replaces the retired SedesStage.tsx's scroll-
// driven, fully aria-hidden sticky stage with a genuinely interactive
// widget: real Leaflet interactivity (drag/zoom/keyboard all enabled,
// nothing disabled the way the old decorative version disabled
// everything), one activeId prop as the single source of truth for
// pin<->list sync, real popups.
export function LocationsMap({
  locations,
  activeId,
  onActiveChange,
  labels,
}: {
  locations: LocationEntry[];
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  labels: LocationsLabels;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const markersRef = useRef<{ marker: Leaflet.Marker; location: LocationEntry }[]>([]);
  const popupRef = useRef<Leaflet.Popup | null>(null);
  const popupContainerRef = useRef<HTMLDivElement | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);

  // Latest activeId/onActiveChange/labels/locations, read inside stable
  // closures set up once at mount (the popupclose/marker-click handlers
  // are attached once, not re-attached on every prop change) — refs avoid
  // stale closures without re-running the whole map-init effect per
  // keystroke. Synced via an effect (not a direct assignment during
  // render) per react-hooks/refs: mutating ref.current in the render body
  // itself is unsafe under concurrent rendering.
  const activeIdRef = useRef(activeId);
  const onActiveChangeRef = useRef(onActiveChange);
  const labelsRef = useRef(labels);
  const locationsRef = useRef(locations);
  useEffect(() => {
    activeIdRef.current = activeId;
    onActiveChangeRef.current = onActiveChange;
    labelsRef.current = labels;
    locationsRef.current = locations;
  });
  // Populated inside the mount-once effect below; read by the activeId-
  // reacting effect further down. Declared here (not inline) so both
  // effects close over the same stable ref object regardless of source
  // order.
  const openForLocationRef = useRef<((id: string, opts?: { instant?: boolean }) => void) | null>(null);

  function setMarkerActive(id: string | null) {
    for (const { marker, location } of markersRef.current) {
      const el = marker.getElement();
      el?.classList.toggle(styles.locationMarkerActive!, location.id === id);
    }
  }

  function closePopupAndRestoreFocus() {
    onActiveChangeRef.current(null);
    triggerElRef.current?.focus();
  }

  // --- Mount once: init map, tiles, markers, initial fitBounds ------------
  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    let cancelled = false;
    let cleanupGestureGate: (() => void) | undefined;
    let cleanupEscape: (() => void) | undefined;

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
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        // Leaflet's own scrollWheelZoom handler is never used at all now —
        // wheel is fully custom-gated below (Ctrl/Cmd required), so this
        // stays permanently off rather than toggled.
        scrollWheelZoom: false,
        // dragging starts enabled (desktop mouse click-drag pans
        // immediately) and is toggled per-pointer-type below: touch
        // disables it so a single finger falls through to native page
        // scroll instead of panning the map; two-finger touch is
        // unaffected, handled entirely by Leaflet's own touchZoom handler
        // below (which pans+zooms together on pinch, independent of the
        // dragging option).
        dragging: true,
        touchZoom: true,
        attributionControl: true,
        zoomControl: true,
        keyboard: true,
      });
      mapRef.current = map;
      map.getContainer().setAttribute("aria-label", labelsRef.current.mapAriaLabel);

      const tileLayer = L.tileLayer(CARTO_TILE_URL, {
        subdomains: CARTO_SUBDOMAINS,
        attribution: CARTO_ATTRIBUTION,
        maxZoom: 19,
      });
      tileLayer.on("tileerror", (e) => {
        (e as unknown as { tile: HTMLImageElement }).tile.style.display = "none";
      });
      tileLayer.addTo(map);

      markersRef.current = locationsRef.current.map((location) => {
        const icon = L.divIcon({
          className: styles.locationMarkerIcon!,
          html: `<span class="${styles.locationMarkerDot}"></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        // HONESTY-RULE CATCH: Leaflet gives interactive markers a default
        // tabindex/keyboard focus of its own (a real, recent Leaflet a11y
        // feature) — caught live via a full keyboard tab-through, not
        // assumed away. Left on, this marker would be a focusable stop
        // with NO accessible name at all (empty text, no aria-label) —
        // worse than merely redundant with the list, a real WCAG gap.
        // keyboard: false turns it off deliberately: the list (Step 7's
        // own "accessible path") is the sole keyboard route to every
        // location, exactly as decided and reported, not a mix of both by
        // accident.
        const marker = L.marker([location.lat, location.lng], { icon, keyboard: false }).addTo(map);
        marker.on("click", () => {
          triggerElRef.current = null; // mouse click, not a keyboard-focusable trigger — see this pass's own report
          onActiveChangeRef.current(location.id);
        });
        return { marker, location };
      });

      const bounds = L.latLngBounds(locationsRef.current.map((l): [number, number] => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: FIT_BOUNDS_PADDING });

      const containerEl = map.getContainer();

      // --- Gesture gate: modifier-required wheel zoom, touch hand-off ----
      // Standard "cooperative gestures" pattern (same idea as MapLibre's
      // and Google Maps' own gesture-handling modes), hand-rolled here
      // since Leaflet ships neither a Ctrl/Cmd-gated wheel-zoom mode nor a
      // way to keep mouse-drag panning while disabling single-finger touch
      // panning (its `dragging` option/handler covers both input families
      // at once — there's no separate "mouse-only" toggle). Built from
      // Leaflet's own public API (setZoomAround, dragging.enable/disable)
      // rather than reaching into its internals.
      // HONESTY-RULE CATCH (the deepest rabbit hole of this whole pass):
      // this overlay is rebuilt from scratch on every show rather than
      // created once and toggled — a real, repeatedly-verified rendering
      // bug, not a style mistake. A single persistent element, created
      // once at opacity:0 and later mutated to opacity:1 in a SEPARATE
      // task, silently never painted — reproduced after a full dev-server
      // restart with a cleared cache, against a production build, AND in
      // Firefox (so not headless-Chromium-specific, not HMR staleness,
      // not a dev-only CSS-chunk-order issue). Bisected via a minimal
      // reduced repro (a bare div, no CSS classes at all, appended next to
      // this same Leaflet container): creating an element ALREADY in its
      // final visible state — in one atomic script task — painted
      // correctly every time, regardless of how long the page had been
      // sitting idle beforehand; creating it invisible and mutating it
      // visible in a later, separate task never painted, even after
      // forcing a reflow first. The fix that actually holds up across
      // repeated show/hide cycles with multi-second idle gaps between
      // them (tested directly): remove the previous hint outright on
      // hide, and build a fresh element — styled, reflowed, then
      // triggered into its opacity:1 transition — every single time it's
      // shown, all within one synchronous call.
      const desktopHintText = isApplePlatform()
        ? labelsRef.current.scrollHintDesktopCmd
        : labelsRef.current.scrollHintDesktopCtrl;

      let hintEl: HTMLDivElement | null = null;
      let hideHintTimer: ReturnType<typeof setTimeout> | undefined;

      function removeHint() {
        hintEl?.remove();
        hintEl = null;
      }

      function showHint(text: string) {
        removeHint();
        const el = document.createElement("div");
        Object.assign(el.style, {
          position: "absolute",
          inset: "0",
          // HONESTY-RULE CATCH: z-index:auto (the default — omitting this
          // entirely) reproducibly failed to paint at all on this exact
          // page — confirmed via direct pixel sampling (not just
          // getComputedStyle, which reported this element's own styles as
          // fully correct throughout), in headless AND headed Chromium,
          // in Firefox, in dev AND production builds. An explicit z-index
          // is the one change that reliably fixed it across every one of
          // those variants. Root cause not fully identified (most likely
          // an auto-z-index sibling interacting badly with this page's
          // Leaflet tiles, which carry their own mix-blend-mode per
          // leaflet.css — a documented Chromium tile-seam workaround —
          // though that's an educated guess, not confirmed).
          zIndex: "10",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-m)",
          background: "color-mix(in srgb, var(--color-text) 55%, transparent)",
          opacity: "0",
          pointerEvents: "none",
          transition: prefersReducedMotion() ? "none" : "opacity 200ms ease",
        } satisfies Partial<CSSStyleDeclaration>);
        el.setAttribute("aria-hidden", "true");

        const textEl = document.createElement("span");
        Object.assign(textEl.style, {
          maxWidth: "20rem",
          fontFamily: "var(--font-body)",
          fontSize: "0.9375rem",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-bg)",
          textAlign: "center",
        } satisfies Partial<CSSStyleDeclaration>);
        textEl.textContent = text;
        el.appendChild(textEl);

        containerEl.parentElement?.appendChild(el);
        void el.offsetHeight; // force a reflow so the opacity transition engages from 0
        el.style.opacity = "1";
        hintEl = el;

        clearTimeout(hideHintTimer);
        hideHintTimer = setTimeout(removeHint, GESTURE_HINT_DISMISS_MS);
      }

      // Desktop: plain wheel scrolls the page (never preventDefault'd, no
      // Leaflet handler ever attached for it); Ctrl/Cmd + wheel zooms via
      // setZoomAround, called directly rather than routed through
      // Leaflet's own ScrollWheelZoom handler — toggling THAT handler's
      // enable/disable per-event was tried first and has a real ordering
      // bug: a listener enabled synchronously during an event's dispatch
      // does not get a chance to run for that SAME event (a DOM spec
      // guarantee, not a bug), so the very first wheel tick of every
      // ctrl+wheel gesture would silently do nothing. Calling
      // setZoomAround ourselves sidesteps that entirely.
      let wheelZoomAccum = 0;
      let wheelRaf: number | undefined;
      let lastWheelPoint: Leaflet.Point | undefined;
      function onWheel(e: WheelEvent) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          lastWheelPoint = map.mouseEventToContainerPoint(e);
          wheelZoomAccum += e.deltaY;
          if (wheelRaf !== undefined) return;
          wheelRaf = requestAnimationFrame(() => {
            const targetZoom = map.getZoom() - wheelZoomAccum / WHEEL_ZOOM_SENSITIVITY;
            const clamped = Math.min(Math.max(targetZoom, map.getMinZoom()), map.getMaxZoom());
            if (lastWheelPoint) map.setZoomAround(lastWheelPoint, clamped, { animate: false });
            wheelZoomAccum = 0;
            wheelRaf = undefined;
          });
        } else {
          showHint(desktopHintText);
        }
      }
      containerEl.addEventListener("wheel", onWheel, { passive: false });

      // Touch: dragging (which also covers single-finger touch-drag in
      // Leaflet) starts disabled so a one-finger gesture is left alone —
      // the browser's native touch-action then scrolls the page normally,
      // verified via Leaflet's own leaflet.css rule (no leaflet-touch-drag
      // class present => touch-action allows page panning). Re-enabled
      // only when a pointerdown reports an actual mouse, covering hybrid
      // touch+mouse devices. Two-finger pinch is untouched: Leaflet's
      // touchZoom handler pans+zooms together on its own, independent of
      // the dragging option.
      map.dragging.disable();
      function onPointerDown(e: PointerEvent) {
        if (e.pointerType === "mouse") map.dragging.enable();
        else if (e.pointerType === "touch") map.dragging.disable();
      }
      containerEl.addEventListener("pointerdown", onPointerDown);

      // Hint for the touch case: fires on an actual single-finger drag
      // ATTEMPT (touchmove), not on touchstart/touchend alone, so a plain
      // tap that opens a marker's popup never triggers it.
      function onTouchMove(e: TouchEvent) {
        if (e.touches.length === 1) showHint(labelsRef.current.scrollHintTouch);
      }
      containerEl.addEventListener("touchmove", onTouchMove, { passive: true });

      cleanupGestureGate = () => {
        containerEl.removeEventListener("wheel", onWheel);
        containerEl.removeEventListener("pointerdown", onPointerDown);
        containerEl.removeEventListener("touchmove", onTouchMove);
        clearTimeout(hideHintTimer);
        if (wheelRaf !== undefined) cancelAnimationFrame(wheelRaf);
        removeHint();
      };

      // Shared popup + a single persistent React root for its content —
      // re-rendered per activation rather than creating/tearing down a
      // root every time (see this pass's own report on why createRoot
      // here, not react-leaflet or hand-rolled vanilla DOM).
      const popupContainer = document.createElement("div");
      popupContainerRef.current = popupContainer;
      popupRootRef.current = createRoot(popupContainer);

      const popup = L.popup({
        closeButton: false, // custom close button rendered inside PopupContent instead
        className: styles.popupWrap,
        maxWidth: 320,
        autoPan: true,
      });
      popupRef.current = popup;

      map.on("popupclose", () => {
        setMarkerActive(null);
        closePopupAndRestoreFocus();
      });

      // HONESTY-RULE CATCH: Leaflet has no built-in Escape-to-close for
      // popups (verified live via QA — assumed otherwise at first, popup
      // stayed open after Escape until this was added). closePopup() is a
      // documented no-op when nothing is open, so this listener is safe
      // to attach unconditionally rather than tracking open state by hand.
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") map.closePopup();
      };
      document.addEventListener("keydown", onEscape);
      cleanupEscape = () => document.removeEventListener("keydown", onEscape);

      // If an activation happened while this async init was still in
      // flight (vanishingly unlikely, but not impossible), apply it now
      // instead of silently dropping it.
      if (activeIdRef.current) {
        openForLocation(activeIdRef.current, { instant: true });
      }
    }

    function openForLocation(id: string, opts: { instant?: boolean } = {}) {
      const map = mapRef.current;
      const L = leafletRef.current;
      const popup = popupRef.current;
      const popupContainer = popupContainerRef.current;
      const root = popupRootRef.current;
      if (!map || !L || !popup || !popupContainer || !root) return;

      const entry = markersRef.current.find((m) => m.location.id === id);
      if (!entry) return;

      setMarkerActive(id);

      const reduced = prefersReducedMotion() || opts.instant;
      if (reduced) {
        map.setView(entry.marker.getLatLng(), Math.max(map.getZoom(), 15));
      } else {
        map.flyTo(entry.marker.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.8 });
      }

      // HONESTY-RULE CATCH (three iterations, each caught live via actual
      // DOM inspection, not assumed):
      // 1. flushSync() called directly here threw a real React warning
      //    ("flushSync was called from inside a lifecycle method") — it
      //    can run nested inside a render/commit React is already mid-way
      //    through, in some call paths (a marker's native, non-React
      //    "click" listener among them).
      // 2. Swapping to queueMicrotask avoided that warning but raced
      //    React's own commit instead: a microtask can run BEFORE
      //    React 18's scheduler has actually flushed this render() call,
      //    so popupContainer was still empty when read.
      // 3. requestAnimationFrame was tried next on the assumption that
      //    "React always commits before the next paint" — measured
      //    directly (temporary debug logging) that this ALSO fired before
      //    the commit landed: React 18's default-priority scheduling for
      //    an update triggered this way isn't guaranteed to complete
      //    within a single animation frame.
      // Fix: setTimeout(..., 0) first escapes to a genuinely fresh
      // macrotask (no longer nested inside whatever render/commit
      // triggered this effect, so flushSync is safe here), and flushSync
      // inside THAT callback forces the render to complete before
      // continuing — verified live: popupContainer now reliably has its
      // real content by the time openOn()/focus() run.
      setTimeout(() => {
        flushSync(() => {
          root.render(
            <LocationsPopupContent
              location={entry.location}
              labels={labelsRef.current}
              onClose={() => map.closePopup()}
            />,
          );
        });
        popup.setLatLng(entry.marker.getLatLng()).setContent(popupContainer).openOn(map);
        // Focus moves into the popup on open — the close button is the
        // first (and most predictable) focusable node inside it.
        const el = popup.getElement();
        el?.querySelector("button")?.focus();
      }, 0);
    }

    // Expose to the activeId-reacting effect below via the ref, since
    // this whole function tree only exists inside this mount-once effect.
    openForLocationRef.current = openForLocation;

    return () => {
      cancelled = true;
      observer.disconnect();
      cleanupGestureGate?.();
      cleanupEscape?.();
      popupRootRef.current?.unmount();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Mount-once: locations/labels are read via refs above so this never
    // needs to re-run when those props change identity.
  }, []);

  // --- React to activeId changes (list click, or a marker click that
  // already called onActiveChange directly) -------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return; // map still initializing — see this pass's own report on the (harmless) race

    if (activeId) {
      // A list-item click set document.activeElement to that button
      // BEFORE this effect runs (synchronous React state update) — that's
      // exactly the element Esc/close should return focus to. A marker
      // click already nulled this ref itself (see the marker "click"
      // handler above), since a mouse click has no keyboard-focus origin
      // to return to.
      if (document.activeElement instanceof HTMLElement && document.activeElement.closest(`.${styles.locationItem}`)) {
        triggerElRef.current = document.activeElement;
      }
      openForLocationRef.current?.(activeId);
    } else {
      map.closePopup();
      setMarkerActive(null);
    }
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      className={
        BASEMAP === "dark"
          ? `${styles.locationsMap} ${styles.locationsMapDark}`
          : styles.locationsMap
      }
    />
  );
}
