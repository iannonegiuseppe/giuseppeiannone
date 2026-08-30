"use client";

import Image from "next/image";
import { useState } from "react";
import type { LocationEntry } from "@/components/LocationsSection";
import { imageDimensions, urlFor } from "@/sanity/image";
import type { LocationsLabels } from "@/components/LocationsInteractive";
import { ButtonLink } from "@/components/Button";
import styles from "./sediSection.module.scss";

// Forked from src/components/LocationsPopupContent.tsx. That file's own
// header comment (and this file's own original header, before this edit)
// claimed LocationsPopupContent/LocationsSection is what production
// renders — checked live for this pass (grepped every `<LocationsSection`/
// `<LocationsInteractive` call site): that's stale. Nothing renders those
// two anymore; src/app/[locale]/page.tsx uses SediBlock (this file) and
// src/app/[locale]/contatti/ContattiMap.tsx uses SediMap (which renders
// THIS component) directly. LocationsPopupContent/LocationsSection.module.scss
// are dead code today — not touched by this pass, flagged here instead of
// silently fixed, since deleting dead code wasn't asked for.
//
// Photo-as-background pass: was a fixed-aspect band above the text block
// (.popupPhotoWrap, 16:9, top corners only). Direct instruction: the photo
// becomes the popup's own background, address/city/actions sit over it on
// a scrim (.popupScrim — see that class's own comment in
// sediSection.module.scss for the measured-contrast derivation). Every
// address without a photo (three of four today) renders exactly as before
// — plain solid var(--color-bg), no scrim, nothing conditional on that
// path changes.
//
// Placeholder pass — tried wiring SEDE_PLACEHOLDER_IMAGE (the marquee's
// own drawn-illustration fallback) in here too, for the same "a location
// looks the same everywhere" reasoning, then reverted after checking the
// actual rendered result: .popupScrim's 76% color-mix toward --color-bg
// was measured and tuned against a real photo's own brightness (see that
// class's own comment) — against this illustration's much paler, flatter
// palette, the same scrim doesn't just dim it, it muddies the crisp
// line-art into a washed-out smudge, undermining the one property that
// made a drawing the right choice here (reads clearly as "not a photo").
// Screenshotted at 1440 to confirm before reverting, not assumed. Fixing
// this properly means a treatment designed for the illustration, not a
// data-layer fallback swap — a follow-up worth doing deliberately, not as
// a side effect of this pass. Every address without a real photo keeps
// its existing, already-correct plain-background rendering here; the
// marquee (a plain image card, no scrim, no overlaid text) is where the
// illustration actually reads correctly today.
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

  const hasPhoto = Boolean(photoUrl && photoDims);

  return (
    <div className={styles.popup} data-has-photo={hasPhoto || undefined}>
      {hasPhoto ? (
        <>
          <Image
            src={photoUrl!}
            alt={location.photo?.alt ?? ""}
            fill
            sizes="320px"
            className={styles.popupPhotoBg}
          />
          <div className={styles.popupScrim} aria-hidden="true" />
        </>
      ) : null}

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

      <div className={styles.popupContent}>
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
    </div>
  );
}
