import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import type { Image as SanityImage } from "sanity";
import { ContactBlock } from "@/components/ContactBlock";
import { ReadingArea } from "@/components/ReadingArea";
import { RelatedArticlesGrid, type RelatedArticleDoc } from "@/components/RelatedArticlesGrid";
import { sanityFetch } from "@/sanity/client";
import { ArticleProgress } from "./ArticleProgress";
import { getArticleBySlug, getArticleHasCounterpart, getArticleSlugs } from "@/sanity/articles";
import { getArticleTrail } from "@/sanity/breadcrumbs";
import { Breadcrumbs } from "@/sanity/BreadcrumbsNav";
import { CONTACT_PHOTO_URL as contactPhotoUrl, CONTACT_PHOTO_ALT as contactPhotoAlt } from "@/sanity/contactPhoto";
import { extractHeadings, headingIdsByKey } from "@/sanity/headings";
import { articleCoverUrl, imageDimensions, urlFor } from "@/sanity/image";
import { buildBlogPostingJsonLd, buildBreadcrumbListJsonLd } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import { aboutPath, articlePath, articlesPath } from "@/sanity/paths";
import { chiSonoPortraitQuery, contactSectionQuery, relatedArticlesQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./article.module.scss";
import { getArticlePortableTextComponents } from "./articlePortableText";
import { getReadingTimeMinutes } from "./readingTime";

// 30-minute ISR fallback beneath the revalidateTag webhook — see
// [locale]/page.tsx's own comment for the full rationale. Applies per
// generated article slug, same as any other ISR route with
// generateStaticParams.
export const revalidate = 86400;

const ARTICLE_BODY_ID = "article-body";

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  cover?: (SanityImage & { alt?: string }) | undefined;
  tags?: string[];
  body: unknown;
  seo?: SeoFields;
}

interface ChiSonoPortrait {
  portrait?: (SanityImage & { alt?: string }) | undefined;
  paragraphs?: string[];
}

interface ContactSectionCopy {
  contactSection?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    photoCaption?: string;
  };
  googleProfileLabel?: string;
}

function getChiSonoPortrait(locale: string) {
  return sanityFetch<ChiSonoPortrait | null>(chiSonoPortraitQuery, { locale }, [
    "chiSonoSection",
  ]);
}

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

function getRelatedArticles(locale: string, excludeSlug: string) {
  return sanityFetch<RelatedArticleDoc[]>(
    relatedArticlesQuery,
    { locale, excludeSlug },
    ["article"],
  );
}

// Item 4 (author bio) — up to and including the first ". "/end-of-string,
// so a caller can pull just the opening sentence out of a longer CMS
// paragraph without hand-editing that paragraph's own text.
function firstSentence(paragraph: string): string {
  const match = paragraph.match(/^[^.]*\.(?=\s|$)/);
  return match ? match[0] : paragraph;
}

// Builds the end-of-article bio verbatim from chiSonoSection.paragraphs —
// paragraph 3 (credentials) whole, plus paragraph 5's own opening sentence
// (current focus/locations) — never invented or reworded here, only
// selected/trimmed. Both are real CMS content Giuseppe wrote himself (see
// this pass's own report for the sentence-by-sentence source). Returns
// undefined if the document doesn't have at least 5 paragraphs, rather
// than rendering a partial/wrong bio.
function buildAuthorBio(paragraphs?: string[]): string | undefined {
  if (!paragraphs || paragraphs.length < 5) return undefined;
  const credentials = paragraphs[2];
  const focus = paragraphs[4];
  if (!credentials || !focus) return undefined;
  return `${credentials} ${firstSentence(focus)}`;
}

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const slugs = await getArticleSlugs(params.locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const typedLocale = locale as "it" | "en";
  const otherLocale = typedLocale === "it" ? "en" : "it";
  const [data, siteSettings, hasCounterpart] = await Promise.all([
    getArticleBySlug(locale, slug) as Promise<ArticleData | null>,
    getSiteSettings(locale),
    getArticleHasCounterpart(otherLocale, slug),
  ]);

  // Language-switching pass — real cross-locale hreflang, wired the moment
  // a same-slug counterpart exists in the other locale (checked live, not
  // assumed from a translation.metadata document — see
  // getArticleHasCounterpart's own comment). LocaleSwitcher.tsx already
  // reads whichever alternate <link> this emits; no change needed there.
  const localizedPaths = hasCounterpart
    ? { [typedLocale]: articlePath(typedLocale, slug), [otherLocale]: articlePath(otherLocale, slug) }
    : { [typedLocale]: articlePath(typedLocale, slug) };

  // Fallback-target pass — for the 463 articles with no counterpart, send
  // the switcher to the other locale's /blog listing rather than its
  // homepage: a visitor pressing EN on an Italian-only article still wants
  // articles, not the front door. buildMetadata only uses this when
  // localizedPaths above doesn't already cover otherLocale (i.e. exactly
  // the no-counterpart case) — harmless to pass unconditionally.
  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths,
    fallbackPath: articlesPath(otherLocale),
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as "it" | "en";

  const [data, siteSettings, chiSono, contactCopy, related] = await Promise.all([
    getArticleBySlug(locale, slug) as Promise<ArticleData | null>,
    getSiteSettings(locale),
    getChiSonoPortrait(locale),
    getContactSectionCopy(locale),
    getRelatedArticles(locale, slug),
  ]);
  if (!data) notFound();

  const siteUrl = getSiteUrl();
  const path = articlePath(typedLocale, slug);
  const pageUrl = `${siteUrl}${path}`;

  const trail = await getArticleTrail(
    typedLocale,
    "Blog",
    articlesPath(typedLocale),
    data.title,
    path,
  );
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);

  const authorName = siteSettings?.author?.name
    ? `Dr. ${siteSettings.author.name}`
    : undefined;
  const authorJobTitle = siteSettings?.author?.credentials;
  // The hero's rendered source — the one shared article-cover URL (see
  // articleCoverUrl). Deliberately NOT the same as coverImageUrl below.
  const coverSrc = data.cover ? articleCoverUrl(data.cover) : null;
  // JSON-LD only, never next/image: this is emitted as a raw cdn.sanity.io
  // URL into BlogPosting structured data, so it costs no Vercel image
  // transformation and is intentionally left at a flat 1200 — Google's
  // structured-data guidance wants >=1200px wide, and the shared cover URL
  // above resolves below that for the 56% of covers whose natural width is
  // under 1200.
  const coverImageUrl = data.cover ? urlFor(data.cover).width(1200).url() : undefined;
  const blogPostingJsonLd = authorName
    ? buildBlogPostingJsonLd({
        headline: data.title,
        url: pageUrl,
        siteUrl,
        datePublished: data.publishedAt ?? undefined,
        authorName,
        authorJobTitle,
        imageUrl: coverImageUrl,
      })
    : undefined;

  const headings = extractHeadings(data.body);
  const headingIds = headingIdsByKey(headings);
  const tocHeadings = headings.filter((h) => h.level === "h2");
  const components = getArticlePortableTextComponents(headingIds);
  const readingMinutes = getReadingTimeMinutes(data.body);

  const portraitDims = chiSono?.portrait ? imageDimensions(chiSono.portrait) : null;
  // Chi sono build pass — points at the real /chi-sono, /en/about-me
  // page now that it exists (was a homepage #chi-sono anchor before that
  // route was built; the header nav's own PREVIEW_GATE_ANCHOR_OVERRIDES
  // was reversed for this same reason, see headerNavItems.ts).
  const chiSonoHref = aboutPath(typedLocale);
  // Seventh pass, item 4 — sourced from chiSonoSection.paragraphs (see
  // buildAuthorBio's own comment), fetched per-locale by the same
  // chiSonoPortraitQuery already used for the avatar above. Both it/en
  // documents have 5 paragraphs each (confirmed by reading the live
  // dataset directly) — this is locale-agnostic, so it renders correctly
  // on /en too rather than falling back to Italian.
  const authorBio = buildAuthorBio(chiSono?.paragraphs);

  const contactSection = contactCopy?.contactSection;
  // contactPhotoUrl/contactPhotoAlt: single-sourced (src/sanity/contactPhoto.ts),
  // same photo the homepage's own ContactBlock invocation uses. Flagged in
  // an earlier pass's own report as a real tension with the avatar above
  // (which deliberately uses a CMS-sourced image instead) — but this is
  // the same "same portrait as the homepage" photo, honestly.

  // Fuller author section at the end of the article body: portrait, name,
  // credentials, bio, link. Seventh pass, item 4 — bio wired from
  // chiSonoSection.paragraphs (buildAuthorBio, above), verbatim, both
  // it/en. siteSettings.author.bio is still just a placeholder ("[Segnaposto
  // IT — biografia. Testo non definitivo, non clinico.]") and stays unused
  // here for that reason. Passed into ReadingArea's own afterBody slot
  // (extraction pass) — article-only content, rendered inside .column
  // after .body, same position it always had.
  const endAuthorBlock = authorName ? (
    <div className={styles.endAuthor}>
      <div className={styles.endAuthorInner}>
        {chiSono?.portrait && portraitDims ? (
          <Image
            src={urlFor(chiSono.portrait).width(240).height(240).url()}
            alt=""
            width={120}
            height={120}
            className={styles.endAuthorPortrait}
          />
        ) : null}
        <div className={styles.endAuthorText}>
          <p className={styles.endAuthorName}>{authorName}</p>
          {authorJobTitle ? (
            <p className={styles.endAuthorCredentials}>{authorJobTitle}</p>
          ) : null}
          {authorBio ? <p className={styles.endAuthorBio}>{authorBio}</p> : null}
          <Link href={chiSonoHref} className={styles.endAuthorLink}>
            {locale === "en" ? "More about me" : "Scopri di più su di me"}
          </Link>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Item 6 — rendered as a sibling BEFORE .page, not inside it: .page
          applies tone.light-island-surface, which repoints --color-accent-
          hover to the light-surface brown accent for everything nested
          inside it. This element needs the SITE'S OWN root gold-light
          value (dark theme's --color-accent-hover, #e0c8a7 — the lightest
          of the three gold steps in the token set), which only resolves
          correctly outside that repointed scope. Functionally unaffected
          by DOM position: it's fixed-positioned and finds its target via
          document.getElementById(bodyId), not layout containment (see
          ArticleProgress.tsx). */}
      <ArticleProgress bodyId={ARTICLE_BODY_ID} />
      <main className={styles.page}>
      {breadcrumbJsonLd ? <JsonLdScript data={breadcrumbJsonLd} /> : null}
      {blogPostingJsonLd ? <JsonLdScript data={blogPostingJsonLd} /> : null}
      {/* Sixth pass, item 1 — moved OUT of .readingArea entirely: that div
          is now bounded by mixins.container (for the TOC's alignment,
          see .readingArea's own comment), and a container-bound ancestor
          caps ITS full-bleed child too (percentage/vw tricks measure
          against the nearest positioned/bounded box, not the true
          viewport, once a parent has its own max-width) — that's what
          produced the left inset strip. Rendered here as a plain sibling
          before .readingArea instead, so its full-bleed width math runs
          against the real viewport with nothing bounding it. */}
      <div className={styles.coverBand}>
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt=""
            fill
            sizes="100vw"
            className={styles.coverImage}
            priority
          />
        ) : null}
        <div className={styles.coverScrim} aria-hidden="true" />
        <div className={styles.coverHeaderContent}>
          <div className={styles.breadcrumbs}>
            <Breadcrumbs trail={trail} />
          </div>
          {/* Item 2 — "BLOG" kicker removed: the breadcrumb trail
              (Home / Blog / title) already says it, so this was a
              redundant second label. Breadcrumbs/h1/meta/author remain
              centred as a group, unchanged. */}
          {/* Plain, no italic-accent span: the article schema has no
              emphasis-word field (unlike homePage.hero's own
              headlineEmphasisWord) — confirmed by reading the schema
              directly, not guessed. See article.module.scss's own
              .titleEmphasis for the ready-to-use styling if a field is
              added later. */}
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.meta}>
            {data.publishedAt ? (
              <time dateTime={data.publishedAt}>
                {new Date(data.publishedAt).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            ) : null}
            {data.publishedAt ? (
              <span className={styles.metaDivider} aria-hidden="true" />
            ) : null}
            <span>{readingMinutes} min</span>
          </p>
          {authorName ? (
            <div className={styles.author}>
              {chiSono?.portrait && portraitDims ? (
                <Image
                  src={urlFor(chiSono.portrait).width(96).height(96).url()}
                  alt=""
                  width={48}
                  height={48}
                  className={styles.authorAvatar}
                />
              ) : null}
              <div className={styles.authorInfo}>
                <Link href={chiSonoHref} className={styles.authorName}>
                  {authorName}
                </Link>
                {authorJobTitle ? (
                  <span className={styles.authorRole}>{authorJobTitle}</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {/* Extraction pass — .readingArea/.tocWrapper/.column/.body now live
          in the shared ReadingArea component (src/components/ReadingArea.
          tsx), which the pillar route also renders through. Article keeps
          its own renderer (articlePortableText.tsx) and passes the
          rendered result in as children — ReadingArea never imports
          next-sanity or knows which component map produced it. endAuthor
          goes in via afterBody (same position inside .column it always
          had — see that prop's own comment on ReadingArea.tsx). No
          topOffset passed — this route's header is always collapsed
          (forceCollapsed) by the time the TOC is visible, which is exactly
          ReadingArea's own default (--header-height-collapsed). */}
      <ReadingArea
        headings={tocHeadings}
        bodyId={ARTICLE_BODY_ID}
        afterBody={endAuthorBlock}
      >
        <PortableText value={data.body as never} components={components} />
      </ReadingArea>

      {/* Item 4 — the real, shared ContactBlock (photo column + form side
          by side), the exact component/props the homepage's own
          ContactSection renders (src/app/[locale]/page.tsx) — not forked,
          not just the bare ContactForm alone. contactSection copy now comes from
          the corrected contactSectionQuery (was reading the schema's own
          "DEPRECATED, see contactSection" contactLab field — a real bug
          fixed this pass, see queries.ts's own comment on
          contactSectionQuery). */}
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

      {/* Item 5 — three most recent articles excluding this one, now full
          container width with larger cards. No category/tag matching: see
          relatedArticlesQuery's own comment (370/468 articles have no
          tags) for why an honest recency-based list is what's here, not a
          similarity engine. */}
      <RelatedArticlesGrid
        items={related}
        locale={locale}
        heading={locale === "en" ? "More from the blog" : "Altri articoli dal blog"}
      />
      </main>
    </>
  );
}
