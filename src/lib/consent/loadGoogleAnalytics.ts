import { hasConsent } from "./consent";

// Google Analytics (GA4) — gated by the "analytics" consent category via
// runWhenConsented (consent.ts). This module never runs on its own; the
// only real entry point is loadGoogleAnalytics, called exclusively from
// AnalyticsLoader.tsx as `runWhenConsented("analytics", loadGoogleAnalytics)`.
// Nothing here creates a <script> element or touches window.gtag/dataLayer
// until that fires — no tag exists in the DOM, and no request reaches
// googletagmanager.com or google-analytics.com, before consent. This is
// deliberately NOT Google's Consent Mode (load the tag, report denied) —
// the published privacy policy says nothing loads before consent, so the
// tag itself must not exist until then.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Direct instruction: no env var — a GA4 Measurement ID isn't a secret
// (it's visible in the page source of any site running GA), and there's
// one Google Analytics account, not one per environment, so an env var
// bought nothing but indirection here.
const GA_MEASUREMENT_ID = "G-GYXP1HQWY6";

let loaded = false;

function sendPageView(): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Only ever called via runWhenConsented("analytics", loadGoogleAnalytics)
 * — never call this directly from a mount effect, that would bypass the
 * gate. Sets up the gtag queue stub, injects gtag.js, and sends the first
 * page_view. send_page_view is disabled in the config call below because
 * App Router doesn't fire a fresh page load on client-side navigation —
 * every page_view (including this first one) goes through the same
 * trackPageView() codepath below, so there's one rule for all of them,
 * not "the first one is automatic, the rest are manual." */
export function loadGoogleAnalytics(): void {
  if (loaded) return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  // Sent FIRST, before "js"/"config" — confirmed live that sending this
  // as a later "update" (after config/event had already been queued)
  // does not retroactively unlock anything: gtag.js still sent zero
  // requests beyond its own script and never set _ga/_gid. Consent Mode's
  // own processing model applies whatever state is current AT THE TIME
  // each queued command is walked, so "granted" has to be in the queue
  // before config/event, not after.
  window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "granted" });
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  trackPageView();
}

/** Called on every client-side route change (AnalyticsLoader.tsx) AND
 * once from loadGoogleAnalytics() above for the first page — the same
 * codepath either way. Checks LIVE consent state, not just "was GA loaded
 * at some point": the gtag.js script itself can't be un-loaded once
 * injected (removing the <script> element doesn't undo what it already
 * defined), so after a withdrawal window.gtag stays callable — this check
 * is what actually stops new data going out, not the script's presence. */
export function trackPageView(): void {
  if (!hasConsent("analytics")) return;
  sendPageView();
}

export function isGoogleAnalyticsLoaded(): boolean {
  return loaded;
}
