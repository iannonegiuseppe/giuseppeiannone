"use client";

import { openConsentManager } from "@/lib/consent/consent";
import styles from "./CookiePreferencesLink.module.scss";

// Wired handler, replacing the old href="#" placeholder — reopens
// CookieConsentBanner (rendered once, at layout level) with the stored
// choice already reflected in its toggles; the banner reads getConsent()
// itself the moment it opens. A <button>, not an <a>: it performs an
// in-page action rather than navigating, same reasoning as every other
// dialog trigger in this codebase (ContactFormDialog's own open button,
// etc.).
export function CookiePreferencesLink({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.reset} ${className ?? ""}`}
      onClick={() => openConsentManager()}
    >
      {label}
    </button>
  );
}
