import { sanityFetchPublished } from "@/sanity/client";
import { libriGuidePdfUrlQuery } from "@/sanity/queries";

// Download-flow copy pass — same reasoning as emailFooterData.ts: always
// PUBLISHED, never draft, since an outgoing email has no request-scoped
// visitor draft-mode cookie to respect. Returns null both when no
// libriPage document exists for the locale AND when one exists but
// guidePdf is still unset — sender.ts treats both the same way LibriForm.tsx
// already does (see that file's own comment): never put a URL that would
// 404 into the email.
export async function getLibriGuidePdfUrl(locale: string): Promise<string | null> {
  const result = await sanityFetchPublished<{ guidePdfUrl: string | null } | null>(
    libriGuidePdfUrlQuery,
    { locale },
    ["libriPage"],
  );
  return result?.guidePdfUrl ?? null;
}
