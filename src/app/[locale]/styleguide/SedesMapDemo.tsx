"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import styles from "./styleguide.module.scss";

// Static, non-scrolling demo of the Sedi map styling — duplicated setup
// from design-lab's SedesStage.tsx (same rationale as every other
// duplication on this page: route-scoped modules, no shared import). No
// scroll-driving/flyTo here, just the tile filter + custom marker device,
// centered on the real Cernusco sul Naviglio pair (closest together of
// the real geocoded addresses, so both markers read clearly at this
// demo's small size).
const DEMO_MARKERS: [number, number][] = [
  [45.5122, 9.3369],
  [45.5066, 9.3383],
];
const CARTO_TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>';

export function SedesMapDemo() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [L] = await Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]);
      if (cancelled || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        keyboard: false,
        doubleClickZoom: false,
        boxZoom: false,
      });
      mapRef.current = map;

      L.tileLayer(CARTO_TILE_URL, {
        subdomains: "abcd",
        attribution: CARTO_ATTRIBUTION,
        maxZoom: 20,
      }).addTo(map);

      DEMO_MARKERS.forEach(([lat, lng], i) => {
        const icon = L.divIcon({
          className: styles.sedesMapDemoMarkerIcon!,
          html: `<span class="${styles.sedesMapDemoMarkerDot}${i === 0 ? ` ${styles.sedesMapDemoMarkerActive}` : ""}"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([lat, lng], { icon, keyboard: false, interactive: false }).addTo(map);
      });

      const bounds = L.latLngBounds(DEMO_MARKERS);
      map.fitBounds(bounds, { padding: [40, 40] });

      requestAnimationFrame(() => {
        mapContainerRef.current?.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1"));
      });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapContainerRef} className={styles.sedesMapDemo} aria-hidden="true" />;
}
