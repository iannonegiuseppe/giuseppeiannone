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
export function AnalyticsLoader() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

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
    trackPageView();
  }, [pathname]);

  return null;
}
