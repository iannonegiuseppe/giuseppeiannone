"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { onConsentChange, runWhenConsented } from "@/lib/consent/consent";
import { loadGoogleAnalytics, trackPageView } from "@/lib/consent/loadGoogleAnalytics";
import { isClarityLoaded, loadClarity, stopClarity } from "@/lib/consent/loadClarity";

// Mounted once in the root layout, alongside CookieConsentBanner. Renders
// nothing — its only job is wiring both vendor loaders through the same
// consent gate the banner itself writes to. Neither GA nor Clarity has a
// <script> tag anywhere in this file, the layout, or any other module
// unless/until runWhenConsented's own loader callback actually fires; see
// that function's own comment in consent.ts for why a script tag that
// exists-but-checks-consent-internally isn't good enough — here there's no
// tag at all until then.
//
// GA and Clarity share the "analytics" category, not two separate ones —
// matches the cookie policy's own §2 "Cookie statistici" grouping, which
// lists both under the same heading; this isn't an assumption made here.
//
// ============================================================================
// TEMPORARY PRE-LAUNCH TESTING BYPASS — see docs/pre-launch.md "Blocks
// launch". NEXT_PUBLIC_ANALYTICS_CONSENT_BYPASS, when set to the literal
// string "true", loads GA and Clarity unconditionally on every page,
// ignoring the consent gate entirely — it exists only so the vendor
// integrations themselves (do the scripts actually fire, what cookies do
// they set) can be verified on the preview domain before a real visitor's
// consent choice is on the line. It does NOT touch CookieConsentBanner,
// consent.ts, or the runWhenConsented() calls below — the banner still
// renders, still writes real choices, and withdrawal still calls
// stopClarity() exactly as it does without this flag; only the unconditional
// load path is new. NEXT_PUBLIC_-prefixed because this reads in the
// browser — Next.js only exposes env vars to the client bundle under that
// prefix, so the value is baked in at build time, not injected at runtime.
// Revert this whole block (and its useEffect below) to remove the bypass
// capability outright; unset the env var in Vercel to turn it off without
// a code change.
const CONSENT_BYPASS_ACTIVE = process.env.NEXT_PUBLIC_ANALYTICS_CONSENT_BYPASS === "true";

function warnConsentBypassActive(): void {
  // eslint-disable-next-line no-console -- deliberate, load-bearing: this
  // is the "impossible to have this running and not notice" requirement.
  console.warn(
    "%c[ANALYTICS_CONSENT_BYPASS] GA4 and Microsoft Clarity are loading on " +
      "EVERY page load, ignoring visitor consent. This is a temporary " +
      "pre-launch testing flag (NEXT_PUBLIC_ANALYTICS_CONSENT_BYPASS=true) " +
      "and MUST be removed before the domain switches — see " +
      "docs/pre-launch.md, \"Blocks launch\".",
    "background:#b91c1c;color:#fff;font-weight:bold;padding:2px 6px;",
  );
}
// ============================================================================

export function AnalyticsLoader() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // Bypass load path — separate effect, deliberately not merged into the
  // consent-gated effect below, so the diff that removes this stays a
  // single, obvious block. Fires once per full page load (mount) and again
  // on every client-side route change (the pathname effect further down),
  // matching "log on every page load."
  useEffect(() => {
    if (!CONSENT_BYPASS_ACTIVE) return;
    warnConsentBypassActive();
    loadGoogleAnalytics();
    loadClarity();
  }, []);

  useEffect(() => {
    const unsubscribeGA = runWhenConsented("analytics", loadGoogleAnalytics);
    const unsubscribeClarity = runWhenConsented("analytics", loadClarity);
    // Withdrawal (or switching to necessary-only after having accepted)
    // can't un-load either script once injected — but Clarity records
    // continuously rather than firing discrete events, so unlike GA's
    // trackPageView() (which re-checks consent on every call) there's no
    // per-event hook to gate. stopClarity() is the only way to actually
    // halt an in-progress recording instead of just leaving it running
    // until the next reload.
    const unsubscribeStop = onConsentChange((state) => {
      if (isClarityLoaded() && state?.analytics !== true) {
        stopClarity();
      }
    });
    return () => {
      unsubscribeGA();
      unsubscribeClarity();
      unsubscribeStop();
    };
  }, []);

  // App Router doesn't fire a fresh page load on client-side navigation,
  // so GA's own automatic pageview (disabled via send_page_view: false in
  // loadGoogleAnalytics) would only ever cover the very first document
  // load. This effect's first run is skipped deliberately — the first
  // page's view is already sent from inside loadGoogleAnalytics() itself,
  // so firing here too would double-count it.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (CONSENT_BYPASS_ACTIVE) warnConsentBypassActive();
    trackPageView();
  }, [pathname]);

  return null;
}
