"use client";

import Image from "next/image";
import { useState } from "react";
import type { LocationEntry } from "./LocationsSection";
import { imageDimensions, urlFor } from "@/sanity/image";
import type { LocationsLabels } from "./LocationsInteractive";
import styles from "./LocationsSection.module.scss";

// Rendered into a plain DOM node that LocationsMap.tsx hands to Leaflet's
// popup via a persistent React root (see that file's own comment on why:
// createRoot is React's own public API, not a new dependency — this
// avoids both react-leaflet and hand-rolled vanilla-DOM event wiring for
// the one piece here that genuinely needs real state, the copy button).
export function LocationsPopupContent({
  location,
  labels,
  onClose,
}: {
  location: LocationEntry;
  labels: LocationsLabels;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  // Partner-centre names pass: heading is always the street address now
  // (was `centerName ?? city` — with centerName cleared everywhere, that
  // fell back to CITY, which isn't the address the brief asked for, and
  // is also non-unique across Milano's two locations). Secondary line is
  // district + city (was address + district, redundant now that address
  // is the heading).
  const fullAddress = location.district
    ? `${location.address}, ${location.district}`
    : location.address;
  const title = location.address;
  const secondary = location.district ? `${location.district}, ${location.city}` : location.city;

  const googleHref = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
  const appleHref = `https://maps.apple.com/?daddr=${location.lat},${location.lng}`;

  const photoUrl = location.photo
    ? urlFor(location.photo).width(640).height(360).format("webp").quality(80).url()
    : undefined;
  const photoDims = location.photo ? imageDimensions(location.photo) : null;

  async function handleCopy() {
    const text = fullAddress;
    // Clipboard API isn't available on http:// origins or older browsers —
    // execCommand('copy') via a temporary offscreen textarea is the
    // standard fallback (deprecated but still broadly supported; this is
    // exactly the case it's still legitimately used for).
    let ok = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(textarea);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className={styles.popup}>
      <button
        type="button"
        className={styles.popupClose}
        aria-label={labels.closePopupLabel}
        onClick={onClose}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {photoUrl && photoDims ? (
        <div className={styles.popupPhotoWrap}>
          <Image
            src={photoUrl}
            alt={location.photo?.alt ?? ""}
            width={photoDims.width}
            height={photoDims.height}
            className={styles.popupPhoto}
          />
        </div>
      ) : null}

      <p className={styles.popupTitle}>{title}</p>
      <p className={styles.popupAddress}>{secondary}</p>

      <div className={styles.popupActions}>
        <a href={googleHref} target="_blank" rel="noopener noreferrer" className={styles.popupAction}>
          {labels.googleMapsLabel}
        </a>
        <a href={appleHref} target="_blank" rel="noopener noreferrer" className={styles.popupAction}>
          {labels.appleMapsLabel}
        </a>
        <button type="button" className={styles.popupAction} onClick={handleCopy}>
          {copied ? labels.copiedLabel : labels.copyAddressLabel}
        </button>
      </div>
    </div>
  );
}
