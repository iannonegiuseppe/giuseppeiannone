"use client";

import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import type * as Leaflet from "leaflet";
import type { LocationEntry } from "@/components/LocationsSection";
import type { LocationsLabels } from "@/components/LocationsInteractive";
import { SediPopupContent } from "./SediPopupContent";
import styles from "./sediSection.module.scss";

// Forked from src/components/LocationsMap.tsx — copied near-verbatim (see
// SediBlock.tsx's own comment for why a fork exists at all). Every piece
// of BEHAVIOUR here — pin click, flyTo, recentre, popup open/close,
// gesture gate, keyboard Escape, tile filters — is untouched, per this
// pass's own explicit "do not change map behaviour" instruction. The only
// two differences from the original: the CSS module import (this route's
// own sediSection.module.scss, not the shared LocationsSection.module.scss)
// and which popup-content component it renders (SediPopupContent, this
// route's own popup weighting/photo-gate, not LocationsPopupContent).
const BASEMAP: "light" | "dark" = "light" as "light" | "dark";

const CARTO_TILE_URL =
  BASEMAP === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_SUBDOMAINS = "abcd";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>';

const FIT_BOUNDS_PADDING: [number, number] = [48, 48];
const WHEEL_ZOOM_SENSITIVITY = 100;
const GESTURE_HINT_DISMISS_MS = 1500;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  if (uaData?.platform) return /mac/i.test(uaData.platform);
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}

export function SediMap({
  locations,
  activeId,
  onActiveChange,
  labels,
  listHeight,
}: {
  locations: LocationEntry[];
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  labels: LocationsLabels;
  // Correction pass, item 7: the container's own CSS height now tracks
  // the address list's real height (see SediInteractive.tsx's own
  // ResizeObserver + --list-height custom property). Leaflet caches its
  // own container size internally and does NOT notice a CSS-driven
  // resize on its own — invalidateSize() must be called explicitly after
  // the new height has actually applied, or tiles render against stale
  // dimensions. This prop's only job is to trigger that effect below.
  listHeight?: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const markersRef = useRef<{ marker: Leaflet.Marker; location: LocationEntry }[]>([]);
  const popupRef = useRef<Leaflet.Popup | null>(null);
  const popupContainerRef = useRef<HTMLDivElement | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);

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
        scrollWheelZoom: false,
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
        const marker = L.marker([location.lat, location.lng], { icon, keyboard: false }).addTo(map);
        marker.on("click", () => {
          triggerElRef.current = null;
          onActiveChangeRef.current(location.id);
        });
        return { marker, location };
      });

      const bounds = L.latLngBounds(locationsRef.current.map((l): [number, number] => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: FIT_BOUNDS_PADDING });

      const containerEl = map.getContainer();

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
        void el.offsetHeight;
        el.style.opacity = "1";
        hintEl = el;

        clearTimeout(hideHintTimer);
        hideHintTimer = setTimeout(removeHint, GESTURE_HINT_DISMISS_MS);
      }

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

      map.dragging.disable();
      function onPointerDown(e: PointerEvent) {
        if (e.pointerType === "mouse") map.dragging.enable();
        else if (e.pointerType === "touch") map.dragging.disable();
      }
      containerEl.addEventListener("pointerdown", onPointerDown);

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

      const popupContainer = document.createElement("div");
      popupContainerRef.current = popupContainer;
      popupRootRef.current = createRoot(popupContainer);

      const popup = L.popup({
        closeButton: false,
        className: styles.popupWrap,
        maxWidth: 320,
        autoPan: true,
      });
      popupRef.current = popup;

      map.on("popupclose", () => {
        setMarkerActive(null);
        closePopupAndRestoreFocus();
      });

      const onEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") map.closePopup();
      };
      document.addEventListener("keydown", onEscape);
      cleanupEscape = () => document.removeEventListener("keydown", onEscape);

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

      setTimeout(() => {
        flushSync(() => {
          root.render(
            <SediPopupContent
              location={entry.location}
              labels={labelsRef.current}
              onClose={() => map.closePopup()}
            />,
          );
        });
        popup.setLatLng(entry.marker.getLatLng()).setContent(popupContainer).openOn(map);
        const el = popup.getElement();
        el?.querySelector("button")?.focus();
      }, 0);
    }

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
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activeId) {
      if (document.activeElement instanceof HTMLElement && document.activeElement.closest(`.${styles.locationItem}`)) {
        triggerElRef.current = document.activeElement;
      }
      openForLocationRef.current?.(activeId);
    } else {
      map.closePopup();
      setMarkerActive(null);
    }
  }, [activeId]);

  // Correction pass, item 7: the container's CSS height changes whenever
  // the address list's own measured height changes (--list-height, set by
  // the parent). Leaflet must be told explicitly — a rAF (not a bare
  // synchronous call) so the new height has actually been painted before
  // invalidateSize() reads the container's real box.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const raf = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(raf);
  }, [listHeight]);

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
