"use client";

import dynamic from "next/dynamic";
import type { LocationEntry } from "@/components/LocationsSection";
import type { LocationsLabels } from "@/components/LocationsInteractive";
import { useSediMapContext } from "@/components/SediMapContext";
import styles from "./page.module.scss";

// Reuses SediMap directly — not SediBlock/SediInteractive — because this
// page carries its own address list (the four location cards, built to
// this page's own design), and SediInteractive always pairs the map with
// ITS OWN address list column; using it as intended here would print
// every address twice. SediMap itself (pins, flyTo, styled popups with
// directions/copy actions) is reused completely as-is — zero
// modifications to that file.
//
// Nine-revisions pass, item 8: activeId now comes from SediMapContext
// (shared with ContattiLocationCards.tsx, both under the SediMapProvider
// in page.tsx) instead of a private useState — this IS "the mechanism the
// homepage address list uses" your brief asked to reuse, not a second one.
//
// Same "critical rendering rule" as SediInteractive.tsx's own SediMap
// import: dynamically imported with ssr:false so Leaflet (which needs
// `window`) never runs server-side, and loading:()=>null so there's no
// placeholder frame competing with real content while it loads.
const SediMap = dynamic(() => import("@/components/SediMap").then((m) => m.SediMap), {
  ssr: false,
  loading: () => null,
});

export function ContattiMap({
  locations,
  labels,
}: {
  locations: LocationEntry[];
  labels: LocationsLabels;
}) {
  const { activeId, selectLocation } = useSediMapContext();

  return (
    <div className={styles.mapWrap}>
      <SediMap
        locations={locations}
        activeId={activeId}
        onActiveChange={(id) => selectLocation(id, { scroll: false })}
        labels={labels}
      />
    </div>
  );
}
