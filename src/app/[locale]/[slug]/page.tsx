import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Image as SanityImage } from "sanity";
import { ContactBlock } from "@/components/ContactBlock";
import { PillarFactsStrip, type FactsStripData } from "@/components/PillarFactsStrip";
import { PillarFaq, type PillarFaqItem } from "@/components/PillarFaq";
import { PillarHero } from "@/components/PillarHero";
import { PillarRecognition, type RecognitionData } from "@/components/PillarRecognition";
import { ReadingArea } from "@/components/ReadingArea";
import { RelatedArticlesGrid, type RelatedArticleDoc } from "@/components/RelatedArticlesGrid";
import { Breadcrumbs } from "@/sanity/BreadcrumbsNav";
import { getPillarTrail } from "@/sanity/breadcrumbs";
import { sanityFetch, sanityFetchPublished } from "@/sanity/client";
import { CONTACT_PHOTO_URL as contactPhotoUrl, CONTACT_PHOTO_ALT as contactPhotoAlt } from "@/sanity/contactPhoto";
import { extractHeadings, headingIdsByKey } from "@/sanity/headings";
import {
  buildBreadcrumbListJsonLd,
  buildMedicalWebPageJsonLd,
  type MedicalEntityType,
} from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import type { AlternateEntry } from "@/sanity/paths";
import { pagePath, pillarLocalizedPaths, pillarPath } from "@/sanity/paths";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import {
  contactSectionQuery,
  pageSlugsQuery,
  pillarSlugsQuery,
  relatedArticlesQuery,
  rootSlugQuery,
} from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import { TableOfContents } from "@/sanity/TableOfContents";
import styles from "./page.module.scss";

// 30-minute ISR fallback beneath the revalidateTag webhook — see
// [locale]/page.tsx's own comment for the full rationale. Applies per
// generated slug, same as any other ISR route with generateStaticParams
// — each pillar page gets its own independent revalidation window.
export const revalidate = 1800;

interface PillarPageData {
  _id: string;
  title: string;
  heroImage?: (SanityImage & { alt?: string }) | undefined;
  heroKicker?: string;
  standfirst?: string;
  titleEmphasisWord?: string;
  factsStrip?: FactsStripData;
  recognition?: RecognitionData;
  faqItems?: PillarFaqItem[];
  relatedArticles?: RelatedArticleDoc[];
  body: unknown;
  seo?: SeoFields;
  medicalEntityType?: MedicalEntityType;
  alternates?: AlternateEntry[];
}

interface GenericPageData {
  _id: string;
  title: string;
  body: unknown;
  seo?: SeoFields;
  alternates?: AlternateEntry[];
}

type ResolvedRootDoc =
  | { kind: "pillar"; data: PillarPageData }
  | { kind: "page"; data: GenericPageData };

interface ContactSectionCopy {
  contactSection?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    photoCaption?: string;
  };
  googleProfileLabel?: string;
}

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

// Fills any slots pillarPage.relatedArticles left open (up to 3 total)
// with the same recency-ordered fallback the blog article page's own
// related-posts section already uses — no tag matching (370/468 articles
// have no tags, see relatedArticlesQuery's own comment). Dedupes by _id so
// an article already explicitly picked never appears twice.
async function getRelatedArticlesWithFallback(
  locale: string,
  explicit: RelatedArticleDoc[],
): Promise<RelatedArticleDoc[]> {
  if (explicit.length >= 3) return explicit.slice(0, 3);

  const fallback = await sanityFetch<RelatedArticleDoc[]>(
    relatedArticlesQuery,
    { locale, excludeSlug: "" },
    ["article"],
  );

  const explicitIds = new Set(explicit.map((doc) => doc._id));
  const fill = fallback.filter((doc) => !explicitIds.has(doc._id));

  return [...explicit, ...fill].slice(0, 3);
}

// Root-namespace pass — resolves ONE slug against BOTH root-level
// document types in a single request (rootSlugQuery), rather than trying
// pillarPage then falling back to page: a sequential try/fallback can
// never observe a collision (it just silently picks whichever it checks
// first), and it costs a second round-trip on every request. See
// queries.ts's own comment on rootSlugQuery.
//
// Precedence: pillarPage wins. Pillars are the site's only indexed
// non-blog content today and predate the page type; authoring-time
// validation (Step 3 of this pass) is meant to make this branch
// unreachable in practice, so precedence here is a backstop, not the
// primary defence. The collision is still logged — silence is exactly
// the failure mode this whole pass exists to close, so a
// deterministic-but-quiet winner would just reproduce it. Run
// scripts/audit-root-slug-collisions.ts to check the whole dataset at
// once rather than waiting for a request to hit the collision.
async function resolveRootSlug(
  locale: string,
  slug: string,
): Promise<ResolvedRootDoc | null> {
  const { pillar, page } = await sanityFetch<{
    pillar: PillarPageData | null;
    page: GenericPageData | null;
  }>(rootSlugQuery, { locale, slug }, [
    "pillarPage",
    "page",
    `pillarPage:${slug}`,
    `page:${slug}`,
  ]);

  if (pillar && page) {
    console.warn(
      `[root-resolver] Slug collision at /${slug} (locale=${locale}): pillarPage ${pillar._id} and page ${page._id} both claim it. Serving the pillar page — the page is unreachable at this URL until the collision is resolved.`,
    );
  }

  if (pillar) return { kind: "pillar", data: pillar };
  if (page) return { kind: "page", data: page };
  return null;
}

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const [pillars, pages] = await Promise.all([
    sanityFetchPublished<{ slug: string }[]>(pillarSlugsQuery, { locale: params.locale }, [
      "pillarPage",
    ]),
    sanityFetchPublished<{ slug: string }[]>(pageSlugsQuery, { locale: params.locale }, [
      "page",
    ]),
  ]);

  // Deduped: a collision (both types publishing the same slug) must not
  // emit duplicate static params — Next.js errors on that at build time.
  // Deduping degrades a collision to "one param, precedence decides which
  // document renders there" instead of a broken build.
  const slugs = new Set([...pillars, ...pages].map((doc) => doc.slug));
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const [resolved, siteSettings] = await Promise.all([
    resolveRootSlug(locale, slug),
    getSiteSettings(locale),
  ]);

  return await buildMetadata({
    locale: locale as "it" | "en",
    title: resolved?.data.title ?? "",
    seo: resolved?.data.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: pillarLocalizedPaths(resolved?.data.alternates),
  });
}

export default async function RootSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const resolved = await resolveRootSlug(locale, slug);
  if (!resolved) notFound();

  const typedLocale = locale as "it" | "en";
  const siteUrl = getSiteUrl();
  const path =
    pillarLocalizedPaths(resolved.data.alternates)[typedLocale] ??
    (resolved.kind === "pillar" ? pillarPath(typedLocale, slug) : pagePath(typedLocale, slug));
  const pageUrl = `${siteUrl}${path}`;

  const trail = await getPillarTrail(typedLocale, resolved.data.title, path);
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);

  const headings = extractHeadings(resolved.data.body);
  const headingIds = headingIdsByKey(headings);
  const components = await getPortableTextComponents(locale, headingIds);

  if (resolved.kind === "pillar") {
    const [siteSettings, contactCopy, related] = await Promise.all([
      getSiteSettings(locale),
      getContactSectionCopy(locale),
      getRelatedArticlesWithFallback(locale, resolved.data.relatedArticles ?? []),
    ]);

    const medicalWebPageJsonLd = buildMedicalWebPageJsonLd({
      url: pageUrl,
      name: resolved.data.title,
      description: resolved.data.seo?.metaDescription,
      medicalEntityType: resolved.data.medicalEntityType,
    });

    const contactSection = contactCopy?.contactSection;
    // contactPhotoUrl/contactPhotoAlt: single-sourced (src/sanity/contactPhoto.ts).
    const t = await getTranslations({ locale, namespace: "PillarPage" });
    const relatedArticlesHeading = t("relatedArticlesHeading");

    return (
      <main>
        <JsonLdScript data={breadcrumbJsonLd} />
        <JsonLdScript data={medicalWebPageJsonLd} />

        {/* Sections 1-3: Hero, Facts strip, Recognition — one continuous
            band, per this pass's own brief ("inside the same section").
            No explicit dark fill: the page is dark by default (see
            page.module.scss's own comment) — this is just the ambient
            background. Single hard, flat junction into the light island
            below — no border/shadow, matching this site's own established
            tonal-change convention. */}
        <section className={styles.darkBand}>
          {/* Refinement pass, item 2 — Hero + Facts strip are pinned to
              exactly one viewport height together (.heroViewport); Recognition
              sits below, unconstrained, still on the same ambient dark
              background as a sibling. */}
          <div className={styles.heroViewport}>
            <PillarHero
              trail={trail}
              heroKicker={resolved.data.heroKicker ?? ""}
              title={resolved.data.title}
              titleEmphasisWord={resolved.data.titleEmphasisWord}
              standfirst={resolved.data.standfirst ?? ""}
              heroImage={resolved.data.heroImage}
            />
            <PillarFactsStrip factsStrip={resolved.data.factsStrip} />
          </div>
          <PillarRecognition locale={locale} recognition={resolved.data.recognition} />
        </section>

        {/* Sections 4-7: Body, FAQ, Related articles, Contact — the
            deliberate light interlude inside this dark-default page, same
            tone.light-island-surface mechanism the blog article route's
            own .page already uses (reused, not forked). Extraction pass —
            the reading area itself now renders through the shared
            ReadingArea component (src/components/ReadingArea.tsx), the
            same one the article route uses. No topOffset passed here
            either (diagnosis pass corrected the earlier assumption that
            this route's normal header needed a different value): this
            route's header isn't forceCollapsed, but the reading area sits
            far enough down the page that scrollY is always well past the
            150px scroll-collapse threshold by the time the TOC pins — the
            header is collapsed by then regardless, same height as the
            article's permanently-collapsed one, so ReadingArea's own
            default (--header-height-collapsed) is correct here too. No
            afterBody: the pillar has nothing equivalent to the article's
            end-of-post author block. */}
        <div className={styles.lightIsland}>
          <ReadingArea headings={headings}>
            <PortableText value={resolved.data.body as never} components={components} />
          </ReadingArea>

          <PillarFaq locale={locale} items={resolved.data.faqItems} />

          <RelatedArticlesGrid
            items={related}
            locale={locale}
            heading={relatedArticlesHeading}
          />

          <ContactBlock
            kicker={contactSection?.kicker ?? ""}
            heading={contactSection?.heading ?? ""}
            headingEmphasisWord={contactSection?.headingEmphasisWord}
            photoCaption={contactSection?.photoCaption ?? ""}
            googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
            googleProfileUrl={siteSettings?.googleProfileUrl}
            locale={typedLocale}
            photoUrl={contactPhotoUrl}
            photoAlt={contactPhotoAlt}
          />
        </div>
      </main>
    );
  }

  // "page" branch — the universal page type (root-namespace pass). No
  // medicalWebPageJsonLd here: it asserts medical-schema semantics
  // (medicalEntityType) that don't apply to an arbitrary Giuseppe-authored
  // page — only the generic BreadcrumbList markup carries over. Untouched
  // by this pass, still the simpler pre-existing layout.
  return (
    <main>
      <JsonLdScript data={breadcrumbJsonLd} />
      <Breadcrumbs trail={trail} />
      <h1>{resolved.data.title}</h1>
      <TableOfContents locale={locale} headings={headings} />
      <PortableText value={resolved.data.body as never} components={components} />
    </main>
  );
}
