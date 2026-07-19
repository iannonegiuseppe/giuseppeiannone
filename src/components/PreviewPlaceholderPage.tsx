import { PreviewPlaceholder } from "./PreviewPlaceholder";

// PREVIEW-GATE (temporary): the standalone-route variant — the whole
// page body for a nav destination that resolves to a real route
// (Prezzi, FAQ, Contatti, Risorse, Privacy, Cookie policy) but doesn't
// have a built page yet. Header/Footer come from the [locale] layout, so
// this is just <main> + the same calm placeholder content the homepage-
// anchor variant (PreviewPlaceholderSection.tsx) uses. Each route folder
// under src/app/[locale]/ that renders this (prezzi, pricing, faq,
// contatti, contact, risorse, resources, privacy, cookie-policy) is
// itself part of the gate — delete the folder once the real page is
// ready, nothing else references it.
export function PreviewPlaceholderPage({ locale }: { locale: string }) {
  return (
    <main>
      <PreviewPlaceholder locale={locale} />
    </main>
  );
}
