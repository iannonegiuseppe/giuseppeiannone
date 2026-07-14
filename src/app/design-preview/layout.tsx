import { Cormorant, Marcellus, Source_Sans_3 } from "next/font/google";
import "./design-preview-palette.scss";

// Design-preview artifact — lives OUTSIDE the [locale] segment entirely,
// on purpose: this route needs its OWN footer (dark band, no "developed
// by" credit, per this task's own spec) rather than the real site's
// Header/Footer chrome that [locale]/layout.tsx wraps every real route
// with. Since there's no shared src/app/layout.tsx at the true root
// (every top-level branch — studio, [locale], this one — supplies its
// own <html>/<body>, same pattern src/app/studio/layout.tsx already
// uses), this is a fully independent document root: no NextIntlClientProvider,
// no Lenis, no real Header/Footer, no next-intl routing at all. See
// proxy.ts's own matcher — /design-preview is excluded from the i18n
// middleware for exactly this reason.
//
// Marcellus/Source Sans 3/Cormorant are loaded FRESH here rather than
// reusing [locale]/layout.tsx's own instances — that layout's
// `--font-marcellus`/`--font-lato` custom properties live on ITS OWN
// <html> element, which this route never renders under (different
// document root entirely), so nothing would cascade here regardless.
const marcellus = Marcellus({
  variable: "--dp-font-display",
  subsets: ["latin"],
  weight: ["400"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--dp-font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Companion italic serif for the ONE hero shine treatment (section 1
// only, per this task's own "used once" instruction) — normal 500 isn't
// needed anywhere on this page (no single-family candidate variant here,
// unlike the styleguide task), so only the italic cut is loaded.
const cormorant = Cormorant({
  variable: "--dp-font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["500"],
  style: ["italic"],
  display: "swap",
});

export default function DesignPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      className={`${marcellus.variable} ${sourceSans3.variable} ${cormorant.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
