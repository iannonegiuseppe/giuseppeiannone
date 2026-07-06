import type { Metadata } from "next";
import type { Image } from "sanity";
import { isDraftModeEnabled, sanityFetch } from "./client";
import { urlFor } from "./image";
import { getSiteUrl, resolveRobots } from "./metadata";
import { siteSettingsQuery } from "./queries";

export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: Image;
  noIndex?: boolean;
}

export interface AuthorFields {
  name: string;
  credentials?: string;
  registrationNumber?: string;
  bio?: string;
}

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  facebook?: string;
}

interface SiteSettingsData {
  title: string;
  seo?: SeoFields;
  author?: AuthorFields;
  socialLinks?: SocialLinks;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  // Schema marks this required (deontology element, Stage 3 Step 4) — but
  // that only guides future Studio saves, not documents published before
  // the field existed. Treated as optional here so old data can't crash a
  // render; the footer simply omits the line if it's genuinely missing.
  crisisSupportText?: string;
  googleProfileUrl?: string;
}

export function getSiteSettings(locale: string) {
  return sanityFetch<SiteSettingsData | null>(
    siteSettingsQuery,
    { locale },
    ["siteSettings"],
  );
}

type Locale = "it" | "en";

const OG_LOCALE: Record<Locale, string> = { it: "it_IT", en: "en_US" };

interface BuildMetadataArgs {
  locale: Locale;
  /** Page's own title — used as a fallback source, never shown verbatim
   * unless seo.metaTitle is absent. */
  title: string;
  seo?: SeoFields;
  siteName: string;
  siteSeo?: SeoFields;
  /** Absolute pathname (e.g. "/", "/en", "/disturbi-d-ansia",
   * "/en/anxiety-disorders") per locale, for canonical + hreflang. Must
   * include every locale this page exists in — omit a locale if there's
   * no translation for it yet, rather than guessing a URL. */
  localizedPaths: Partial<Record<Locale, string>>;
}

export async function buildMetadata({
  locale,
  title,
  seo,
  siteName,
  siteSeo,
  localizedPaths,
}: BuildMetadataArgs): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  // Draft-mode responses must never be indexable, on top of never being
  // cached (see sanityFetch) — this holds regardless of the document's
  // own seo.noIndex value.
  const isDraft = await isDraftModeEnabled();

  // Fallback title template ("{page} | {site}") only applies when the
  // document doesn't have its own seo.metaTitle — editors who write a
  // full custom title get exactly that, no forced suffix.
  const finalTitle = seo?.metaTitle || `${title} | ${siteName}`;

  // Never auto-truncate body content into a description — omit entirely
  // rather than show a low-quality auto-generated snippet.
  const description = seo?.metaDescription || undefined;

  const ogImageSource = seo?.ogImage ?? siteSeo?.ogImage;
  const ogImageUrl = ogImageSource
    ? urlFor(ogImageSource).width(1200).height(630).url()
    : undefined;

  const currentPath = localizedPaths[locale] ?? "/";
  const canonical = `${siteUrl}${currentPath}`;

  const languages: Record<string, string> = {};
  if (localizedPaths.it) languages.it = `${siteUrl}${localizedPaths.it}`;
  if (localizedPaths.en) languages.en = `${siteUrl}${localizedPaths.en}`;
  // x-default always points at the Italian version, per the site's
  // default-locale convention.
  languages["x-default"] = languages.it ?? canonical;

  return {
    title: finalTitle,
    description,
    alternates: {
      canonical,
      languages,
    },
    robots: resolveRobots(seo?.noIndex || isDraft),
    openGraph: {
      title: finalTitle,
      description,
      url: canonical,
      locale: OG_LOCALE[locale],
      type: "website",
      images: ogImageUrl
        ? [{ url: ogImageUrl, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}
