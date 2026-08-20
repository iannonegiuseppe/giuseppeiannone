import { sanityFetchPublished } from "@/sanity/client";
import { siteSettingsQuery } from "@/sanity/queries";

// Confirmation/notification email pass — always PUBLISHED siteSettings,
// never draft: an outgoing email has no request-scoped "visitor's own
// draft-mode cookie" to respect (unlike a page render), so this uses
// sanityFetchPublished directly rather than the draft-aware getSiteSettings
// (src/sanity/seo.ts) — same reasoning sitemap.ts/generateStaticParams
// already established for exactly this kind of always-published read.
interface EmailFooterSiteSettings {
  socialLinks?: { instagram?: string };
  author?: { registrationNumber?: string };
}

export interface EmailFooterData {
  instagramUrl: string | null;
  registrationNumber: string | null;
}

export async function getEmailFooterData(locale: string): Promise<EmailFooterData> {
  const settings = await sanityFetchPublished<EmailFooterSiteSettings | null>(
    siteSettingsQuery,
    { locale },
    ["siteSettings"],
  );
  return {
    instagramUrl: settings?.socialLinks?.instagram ?? null,
    registrationNumber: settings?.author?.registrationNumber ?? null,
  };
}
