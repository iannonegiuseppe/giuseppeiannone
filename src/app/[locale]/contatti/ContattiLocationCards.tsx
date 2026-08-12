"use client";

import type { LocationEntry } from "@/components/LocationsSection";
import { useSediMapContext } from "@/components/SediMapContext";
import styles from "./page.module.scss";

// Nine-revisions pass, item 8: the whole card selects that location and
// flies the map to its pin — reusing SediMapContext, the SAME mechanism
// the homepage's own address list (SediInteractive) uses, not a second
// one. The "Indicazioni" link inside each card must keep opening Google
// Maps without also triggering the card's own selection.
//
// Markup chosen to avoid the classic trap here (a link nested inside a
// button, or vice versa — invalid HTML, breaks assistive-tech semantics):
// the card itself is a plain, non-interactive <div>. A real <button>
// (.locationCardSelect) is absolutely positioned to cover the ENTIRE card
// and carries the actual "select this location" action; the "Indicazioni"
// <a> is a LATER sibling with a higher z-index, so it paints on top and
// intercepts its own clicks independently — the button and the link are
// siblings, never nested, and both are real, independently focusable
// elements. e.stopPropagation() on the link's own click is a second,
// belt-and-suspenders guard (the button is a sibling, not an ancestor, so
// its onClick wouldn't fire from a link click anyway via bubbling — but a
// wrapping onClick on the card itself was considered and rejected for
// exactly this reason, since THAT would have required the guard to do any
// work at all; keeping it removes any future risk if the click handler
// ever moves back onto a wrapping element).
export function ContattiLocationCards({
  locations,
  directionsLabel,
  showOnMapLabel,
}: {
  locations: LocationEntry[];
  directionsLabel: string;
  showOnMapLabel: string;
}) {
  const { selectLocation } = useSediMapContext();

  return (
    <div className={styles.locationCards}>
      {locations.map((loc) => {
        const accessibleName = loc.district ? `${loc.city}, ${loc.district}` : loc.city;
        return (
          <div key={loc.id} className={styles.locationCard}>
            <button
              type="button"
              className={styles.locationCardSelect}
              aria-label={`${accessibleName} — ${showOnMapLabel}`}
              onClick={() => selectLocation(loc.id, { scroll: false })}
            />
            {/* district-removal pass: the district line (e.g. "Citylife",
                "Bicocca") no longer renders here — city + street address
                only. Field untouched in the schema/documents; this is a
                display-only change, scoped to this page's own card. The
                aria-label above still reads loc.district when present
                (unchanged, not part of this ask — that's the button's
                accessible name, not visible card output). */}
            <p className={styles.locationCardCity}>{loc.city}</p>
            <p className={styles.locationCardAddress}>{loc.address}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.locationCardLink}
              onClick={(e) => e.stopPropagation()}
            >
              {directionsLabel}
              <span aria-hidden="true"> →</span>
            </a>
          </div>
        );
      })}
    </div>
  );
}
