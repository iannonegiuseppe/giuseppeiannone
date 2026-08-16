"use client";

import Image from "next/image";
import { useState } from "react";
import type { LocationEntry } from "@/components/LocationsSection";
import { imageDimensions, urlFor } from "@/sanity/image";
import type { LocationsLabels } from "@/components/LocationsInteractive";
import { ButtonLink } from "@/components/Button";
import styles from "./sediSection.module.scss";

// Forked from src/components/LocationsPopupContent.tsx (shared with
// production — see SediBlock.tsx's own comment). Copy button/clipboard
// logic is byte-for-byte identical. What changed: three equally-weighted
// pills (.popupAction × 3) are now one primary filled button (Google Maps
// directions) plus two plain text links (Apple Maps, copy address) — see
// this pass's own proposal, part (b). Photo gate is identical to the
// original (renders only when location.photo exists — same pattern as the
// diploma scans).
export function SediPopupContent({
  location,
  labels,
  onClose,
}: {
  location: LocationEntry;
  labels: LocationsLabels;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

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
        <ButtonLink
          href={googleHref}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          className={styles.popupActionPrimary}
        >
          {labels.googleMapsLabel}
        </ButtonLink>
        <div className={styles.popupActionsSecondary}>
          <a href={appleHref} target="_blank" rel="noopener noreferrer" className={styles.popupActionSecondary}>
            {labels.appleMapsLabel}
          </a>
          <button type="button" className={styles.popupActionSecondary} onClick={handleCopy}>
            {copied ? labels.copiedLabel : labels.copyAddressLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
