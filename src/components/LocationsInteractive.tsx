"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { LocationEntry } from "./LocationsSection";
import styles from "./LocationsSection.module.scss";

export type LocationsLabels = {
  mapAriaLabel: string;
  googleMapsLabel: string;
  appleMapsLabel: string;
  copyAddressLabel: string;
  copiedLabel: string;
  closePopupLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  // Both modifier variants resolved server-side; the client picks one via
  // a plain platform check at runtime rather than doing its own i18n
  // interpolation (keeps translation resolution entirely on the server,
  // matching this codebase's "no client component calls useTranslations()"
  // rule).
  scrollHintDesktopCtrl: string;
  scrollHintDesktopCmd: string;
  scrollHintTouch: string;
};

// Critical rendering rule: the map is progressive enhancement ONLY —
// dynamically imported with ssr:false so Leaflet (which needs `window`)
// never runs server-side, and `loading: () => null` so there's no
// placeholder frame competing with the real content while it loads. If
// this import fails outright, or JS never runs, the section directly
// above (the address list, a plain server-rendered part of this same
// client component's own JSX — client components are still fully SSR'd)
// carries every address as real text regardless. See this pass's own
// report for the "map import forced to fail" verification.
const LocationsMap = dynamic(() => import("./LocationsMap").then((m) => m.LocationsMap), {
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

// Single source of truth: activeId drives both the list's own active
// visual state AND the map's popup/flyTo/marker-scale state — a click on
// either side sets the exact same piece of state, so the two can never
// desync (see LocationsMap.tsx's own comment for how it reacts to this
// prop rather than keeping a parallel copy of it).
export function LocationsInteractive({
  locations,
  onlineNote,
  labels,
}: {
  locations: LocationEntry[];
  onlineNote?: string;
  labels: LocationsLabels;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);

  const groups = groupByCity(locations);

  function handleSelect(id: string) {
    setActiveId(id);
    // Mobile: map sits below the list — scrolling it into view is a
    // no-op when it's already fully visible (the desktop two-column
    // layout), so this runs unconditionally rather than behind a media
    // query.
    mapWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className={styles.locationsGrid}>
      <ul className={styles.locationsList} role="list">
        {groups.map((group) => (
          <li key={group.city} className={styles.locationsCityGroup}>
            <p className={styles.locationsCityLabel}>{group.city}</p>
            <ul role="list">
              {group.items.map((loc) => {
                // Partner-centre names pass: client decision — centerName
                // must never render, sitewide (see sede.ts's own comment;
                // the field stays in the schema, unused, in case that
                // changes — this list no longer reads it at all, rather
                // than relying on the data being empty). Address is always
                // the primary line now; district is the only secondary
                // content. Accessible name adds district (or, lacking one,
                // city) for disambiguation between same-city addresses —
                // the group's own city label isn't reliably announced
                // alongside every individual item by all screen readers.
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
                      onClick={() => handleSelect(loc.id)}
                    >
                      <span className={styles.locationItemTitle}>{loc.address}</span>
                      {/* Always rendered, even empty (e.g. Monza: no
                          district) — reserves the same line height for
                          every item regardless of content, per this
                          pass's own item-height requirement. Never filled
                          with invented text. */}
                      <span className={styles.locationItemSub}>{loc.district ?? ""}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
        {onlineNote ? (
          <li className={styles.locationsOnlineNote}>{onlineNote}</li>
        ) : null}
      </ul>
      <div ref={mapWrapRef} className={styles.locationsMapWrap}>
        <LocationsMap
          locations={locations}
          activeId={activeId}
          onActiveChange={setActiveId}
          labels={labels}
        />
      </div>
    </div>
  );
}
