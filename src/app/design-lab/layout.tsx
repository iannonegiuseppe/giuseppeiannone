import { EB_Garamond, Source_Sans_3 } from "next/font/google";
import "./design-lab-globals.scss";

// Density-direction preview — lives OUTSIDE the [locale] segment
// entirely, same reasoning as src/app/design-preview/layout.tsx's own
// comment: no shared src/app/layout.tsx exists at the true root, every
// top-level branch (studio, [locale], design-preview, this one) supplies
// its own <html>/<body>. No NextIntlClientProvider, no Lenis, no real
// Header/Footer — see proxy.ts's own matcher, /design-lab is excluded
// from the i18n middleware for the same reason /design-preview is.
//
// Unlike /design-preview (which deliberately loads its OWN scoped
// palette/fonts to explore an alternate direction), this route uses the
// site's REAL, CURRENT, LOCKED tokens and fonts — the whole point of
// this page is to demonstrate the actual design system at higher
// density, not a new one. Same EB_Garamond/Source_Sans_3 config as
// src/app/[locale]/layout.tsx, loaded fresh here since this is a
// separate document root (nothing cascades from [locale]'s own <html>).
const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function DesignLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      className={`${ebGaramond.variable} ${sourceSans3.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
