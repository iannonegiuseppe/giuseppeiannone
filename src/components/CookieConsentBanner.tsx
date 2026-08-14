"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  type ConsentState,
  getConsent,
  isConsentManagerOpen,
  onConsentChange,
  onConsentManagerOpenChange,
  setConsent,
} from "@/lib/consent/consent";
import { cookiePolicyPath, type Locale } from "@/sanity/paths";
import styles from "./CookieConsentBanner.module.scss";

// Reserves scroll room on the page for this fixed, out-of-flow element —
// see globals.scss's own comment on the one consuming rule (body's own
// padding-bottom). Read here, not hardcoded: the value is measured live
// off the actual rendered banner below, because the real height differs
// by locale (copy length) and by breakpoint (corner card vs. full-width
// sheet).
const CONSENT_BANNER_OFFSET_PROPERTY = "--consent-banner-offset";

// Sitewide consent gate — mechanism only, see src/lib/consent/consent.ts
// for the API this renders against. No gated script exists yet (GA/GTM/
// Clarity/Bing/Meta Pixel), so there's nothing for this pass to actually
// gate; this component is the visible half of "the gate they will later
// pass through."
//
// Rendered nowhere in SSR output on purpose — `mounted` starts false, so
// server HTML and the client's very first paint both omit the banner
// entirely, then the client decides after mount whether a real cookie
// already exists. Avoids two bad outcomes: guessing "undecided" on the
// server (would flash the banner for returning visitors who already
// chose), or guessing "decided" (would hide a first-time visitor's
// banner behind a client-only reveal that reads as broken).
export function CookieConsentBanner({ locale }: { locale: Locale }) {
  const t = useTranslations("CookieConsent");
  const [mounted, setMounted] = useState(false);
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const [marketingChecked, setMarketingChecked] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setConsentState(getConsent());
    setIsOpen(isConsentManagerOpen());
    const unsubConsent = onConsentChange(setConsentState);
    const unsubOpen = onConsentManagerOpenChange(setIsOpen);
    return () => {
      unsubConsent();
      unsubOpen();
    };
  }, []);

  const shouldShow = mounted && (isOpen || consent === null);

  // Toggles resync from the stored choice every time the card becomes
  // visible — covers both "first-ever load" (defaults to off/off) and
  // "reopened from the footer" (must reflect what's actually stored, not
  // whatever was left over from a previous open).
  useEffect(() => {
    if (shouldShow) {
      setAnalyticsChecked(consent?.analytics ?? false);
      setMarketingChecked(consent?.marketing ?? false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  useEffect(() => {
    setLiveMessage(shouldShow ? t("heading") : "");
  }, [shouldShow, t]);

  // Page-side fix for the fixed banner overlapping content near the
  // bottom of a page (found live on /contatti at 390px: the submit
  // button sat under the banner) — reserves body's own bottom padding
  // equal to the banner's REAL rendered height, cleared the instant a
  // choice is made or the banner isn't mounted. ResizeObserver only
  // triggers the re-measure; the actual number always comes from
  // getBoundingClientRect() (border-box, matching what's really on
  // screen), not the observer's own contentRect (which excludes
  // padding/border and would undercount this element's footprint).
  useEffect(() => {
    if (!shouldShow) {
      document.documentElement.style.setProperty(CONSENT_BANNER_OFFSET_PROPERTY, "0px");
      return;
    }
    const banner = bannerRef.current;
    if (!banner) return;

    const applyHeight = () => {
      const height = banner.getBoundingClientRect().height;
      document.documentElement.style.setProperty(CONSENT_BANNER_OFFSET_PROPERTY, `${Math.ceil(height)}px`);
    };

    applyHeight();
    const observer = new ResizeObserver(applyHeight);
    observer.observe(banner);

    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty(CONSENT_BANNER_OFFSET_PROPERTY, "0px");
    };
  }, [shouldShow]);

  function closeAfterDecision() {
    setIsOpen(false);
  }

  function handleAcceptAll() {
    setConsent({ analytics: true, marketing: true });
    closeAfterDecision();
  }

  function handleRejectAll() {
    setConsent({ analytics: false, marketing: false });
    closeAfterDecision();
  }

  function handleSave() {
    setConsent({ analytics: analyticsChecked, marketing: marketingChecked });
    closeAfterDecision();
  }

  return (
    <>
      {/* Always mounted (never conditionally created/destroyed) so
          assistive tech reliably announces a TEXT CHANGE inside an
          already-present live region — some screen readers don't
          announce a live region's content if the region itself mounts
          at the same moment the content does. */}
      <div role="status" aria-live="polite" className={styles.visuallyHidden}>
        {liveMessage}
      </div>

      {shouldShow ? (
        <div ref={bannerRef} className={styles.wrap} role="region" aria-label={t("heading")}>
          <div className={styles.card}>
            <div className={styles.intro}>
              <h2 className={styles.heading}>{t("heading")}</h2>
              <p className={styles.body}>{t("body")}</p>
            </div>

            <div className={styles.toggles}>
              <label className={styles.toggleRow}>
                <span className={styles.toggleLabel}>{t("necessary")}</span>
                <span className={styles.switchWrap}>
                  <input
                    type="checkbox"
                    role="switch"
                    checked
                    disabled
                    aria-checked="true"
                    className={styles.switchInput}
                  />
                  <span className={styles.switchTrack} aria-hidden="true">
                    <span className={styles.switchThumb} />
                  </span>
                </span>
              </label>

              <label className={styles.toggleRow}>
                <span className={styles.toggleLabel}>{t("analytics")}</span>
                <span className={styles.switchWrap}>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={analyticsChecked}
                    aria-checked={analyticsChecked}
                    onChange={(event) => setAnalyticsChecked(event.target.checked)}
                    className={styles.switchInput}
                  />
                  <span className={styles.switchTrack} aria-hidden="true">
                    <span className={styles.switchThumb} />
                  </span>
                </span>
              </label>

              <label className={styles.toggleRow}>
                <span className={styles.toggleLabel}>{t("marketing")}</span>
                <span className={styles.switchWrap}>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={marketingChecked}
                    aria-checked={marketingChecked}
                    onChange={(event) => setMarketingChecked(event.target.checked)}
                    className={styles.switchInput}
                  />
                  <span className={styles.switchTrack} aria-hidden="true">
                    <span className={styles.switchThumb} />
                  </span>
                </span>
              </label>
            </div>

            {/* Equal prominence pair (Italian Garante requirement, not a
                generic a11y nicety): identical pill treatment, identical
                border weight, identical font weight — the ONLY difference
                between accept/reject is which one gets the accent color.
                No filled-vs-outline split, no size difference. */}
            <div className={styles.actionsGroup}>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionAccent}`}
                  onClick={handleAcceptAll}
                >
                  {t("accept")}
                </button>
                <button type="button" className={styles.actionButton} onClick={handleRejectAll}>
                  {t("reject")}
                </button>
              </div>
              <button type="button" className={styles.saveButton} onClick={handleSave}>
                {t("save")}
              </button>
            </div>

            <Link href={cookiePolicyPath(locale)} className={styles.policyLink}>
              {t("link")}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
