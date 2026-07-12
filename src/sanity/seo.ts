import type { Metadata } from "next";
import type { Image } from "sanity";
import { isDraftModeEnabled, sanityFetch } from "./client";
import { urlFor } from "./image";
import { getSiteUrl, resolveRobots } from "./metadata";
import {
  footerSettingsQuery,
  headerSettingsQuery,
  siteSettingsQuery,
} from "./queries";

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

export interface PathwayStep {
  title: string;
  description: string;
}

// CMS-wiring pass: replaces the flat contactEmail/contactPhone/
// whatsappNumber scalars — see siteSettings.ts schema's own comment.
export interface ContactChannel {
  type: "whatsapp" | "phone" | "email";
  label: string;
  value: string;
  order: number;
}

// Availability-badge pass.
export type AvailabilityStatus = "accepting" | "waitlist" | "paused";

interface SiteSettingsData {
  title: string;
  // CMS-driven header/footer pass: shared brand mark, header + footer.
  // Optional — the Logo component renders the text wordmark when absent.
  // aspectRatio (asset->metadata.dimensions.aspectRatio, see queries.ts)
  // lets Logo.tsx size an arbitrary uploaded image correctly without
  // guessing — Sanity images don't otherwise expose their real dimensions
  // without dereferencing the asset.
  logo?: Image & { aspectRatio?: number };
  seo?: SeoFields;
  author?: AuthorFields;
  socialLinks?: SocialLinks;
  contactChannels?: ContactChannel[];
  piva?: string;
  // Schema marks this required (deontology element, Stage 3 Step 4) — but
  // that only guides future Studio saves, not documents published before
  // the field existed. Treated as optional here so old data can't crash a
  // render; the footer simply omits the line if it's genuinely missing.
  crisisSupportText?: string;
  googleProfileUrl?: string;
  carePathway?: PathwayStep[];
  availabilityStatus?: AvailabilityStatus;
  acceptingText?: string;
  waitlistText?: string;
  pausedText?: string;
}

export function getSiteSettings(locale: string) {
  return sanityFetch<SiteSettingsData | null>(
    siteSettingsQuery,
    { locale },
    ["siteSettings"],
  );
}

// CMS-driven header/footer pass. Resolved server-side (called from
// layout.tsx) and passed down as a plain-string src — never raw Sanity
// image data — because Logo.tsx is imported by HeaderInteractive.tsx, a
// "use client" component. urlFor() transitively imports ./client.ts,
// which imports next/headers (draftMode()) and is server-only; if Logo.tsx
// called urlFor() itself, that import would be pulled into the client
// bundle and fail the build. Same established pattern as HeroOverlap.tsx's
// own server-computed `photoSrc`.
export interface ResolvedLogo {
  src: string;
  width: number;
  height: number;
}

const LOGO_HEIGHT = 28;
const LOGO_FALLBACK_ASPECT_RATIO = 4; // used only if metadata.dimensions is ever missing

export function resolveLogoImage(
  logo?: Image & { aspectRatio?: number },
): ResolvedLogo | undefined {
  if (!logo?.asset) return undefined;
  const aspectRatio = logo.aspectRatio ?? LOGO_FALLBACK_ASPECT_RATIO;
  return {
    // No .width()/.height() cap — image-quality pass's own established
    // lesson: capping the source via urlFor below next/image's own retina
    // candidates silently upscales. next/image resizes from the raw asset.
    src: urlFor(logo).url(),
    width: Math.round(LOGO_HEIGHT * aspectRatio),
    height: LOGO_HEIGHT,
  };
}

// Picks the status text matching availabilityStatus, and centralizes the
// "no text for the active status -> no badge" rule (spec: "never an empty
// dot") in one place, rather than leaving each of the 3 call sites
// (Hero, ChannelPickerDialog, FinalContactSection) to re-implement it.
// AvailabilityBadge itself also defensively checks for empty text, so a
// future caller that bypasses this helper still can't render a bare dot.
export function resolveAvailabilityText(
  settings?: Pick<SiteSettingsData, "availabilityStatus" | "acceptingText" | "waitlistText" | "pausedText"> | null,
): { status: AvailabilityStatus; text: string } | null {
  const status = settings?.availabilityStatus;
  if (!status) return null;

  const text =
    status === "accepting"
      ? settings?.acceptingText
      : status === "waitlist"
        ? settings?.waitlistText
        : settings?.pausedText;

  if (!text) return null;
  return { status, text };
}

// CMS-driven header/footer pass.
export interface NavLinkPageRef {
  _id: string;
  _type: string;
  title?: string;
  slug?: string;
  parentSlug?: string | null;
}

export interface NavLinkData {
  linkType?: "route" | "reference";
  routeKey?: string;
  customLabel?: string;
  page?: NavLinkPageRef | null;
  children?: NavLinkData[];
}

interface HeaderSettingsData {
  navItems?: NavLinkData[];
  ctaButtonText?: string;
}

export function getHeaderSettings(locale: string) {
  return sanityFetch<HeaderSettingsData | null>(
    headerSettingsQuery,
    { locale },
    ["headerSettings"],
  );
}

interface FooterColumnHeadings {
  explore?: string;
  locations?: string;
  contact?: string;
  legal?: string;
}

interface FooterSettingsData {
  columnHeadings?: FooterColumnHeadings;
  navItems?: NavLinkData[];
  legalNavItems?: NavLinkData[];
  instagramLabel?: string;
  googleProfileLabel?: string;
}

export function getFooterSettings(locale: string) {
  return sanityFetch<FooterSettingsData | null>(
    footerSettingsQuery,
    { locale },
    ["footerSettings"],
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
