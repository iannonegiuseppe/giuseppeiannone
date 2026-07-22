import { defineQuery } from "next-sanity";

// Used to verify the client can reach the configured dataset (Step 5
// wiring proof).
export const healthCheckQuery = defineQuery(`count(*[])`);

// Shared across every query that returns a `body` (portableText): expands
// the reference-bearing custom blocks so the Portable Text renderer gets
// real data instead of bare {_ref} pointers. "parentSlug" is only
// meaningful when the referenced document is a subtopicPage (a pillarPage
// or article reference just leaves it null).
const bodyProjection = `
  body[]{
    ...,
    _type == "faqBlock" => {
      items[]->{ _id, question, answer }
    },
    _type == "relatedTopics" => {
      items[]->{ _id, _type, title, "slug": slug.current, "parentSlug": parentPillar->slug.current }
    },
    _type == "conditionCard" => {
      ...,
      link->{ _id, _type, title, "slug": slug.current, "parentSlug": parentPillar->slug.current }
    },
    _type == "treatmentCard" => {
      ...,
      link->{ _id, _type, title, "slug": slug.current, "parentSlug": parentPillar->slug.current }
    }
  }
`;

// Resolves this document's it/en siblings via its translation.metadata
// document (^ refers to the enclosing document from within the subquery),
// so pages can build reciprocal hreflang links without a second
// round-trip. parentSlug is only meaningful for subtopicPage siblings.
const alternatesProjection = `
  "alternates": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
    language,
    "slug": value->slug.current,
    "parentSlug": value->parentPillar->slug.current
  }
`;

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings" && language == $locale][0]{
    title,
    seo,
    author,
    socialLinks,
    contactChannels,
    piva,
    crisisSupportText,
    googleProfileUrl,
    carePathway
  }
`);

// locationPage is protected to exactly two (Milan, Monza; see
// structure.ts), so this always returns at most 2 documents for the
// requested locale.
// CMS-driven header/footer pass: locationsQuery (locationPage-backed) is
// retired here — the footer's "Sedi" column now sources addresses from
// `sede` (sedesQuery below), same as the homepage's own Sedi section,
// per this pass's explicit "addresses come from sede docs" instruction.
// This fixes a pre-existing bug an earlier audit pass flagged: locationPage
// had no published documents, so the footer's Sedi column rendered empty.
// The locationPage SCHEMA/document type itself is untouched and still
// protected (CLAUDE.md: "exactly two, Milan/Monza") — only this now-dead
// query projection is removed; nothing about the content model changes.

// Shared by headerSettingsQuery/footerSettingsQuery below — one level of
// nesting (children) is all the UI supports (HeaderNavItem/HeaderNavChild
// is a fixed two-tier shape), so this fragment isn't recursed a third
// time. Reference targets are pillarPage/subtopicPage/article only (see
// navLink.ts's own comment on why "service" isn't included) — the
// parentSlug dereference is a no-op (null) for types that don't have a
// parentPillar field, which is fine, hrefFor only reads it for subtopicPage.
const navLinkFields = `
  linkType,
  routeKey,
  customLabel,
  page->{
    _id,
    _type,
    title,
    "slug": slug.current,
    "parentSlug": parentPillar->slug.current
  }
`;

export const headerSettingsQuery = defineQuery(`
  *[_type == "headerSettings" && language == $locale][0]{
    navItems[]{
      ${navLinkFields},
      children[]{
        ${navLinkFields}
      }
    },
    ctaButtonText
  }
`);

export const footerSettingsQuery = defineQuery(`
  *[_type == "footerSettings" && language == $locale][0]{
    columnHeadings,
    navItems[]{
      ${navLinkFields},
      children[]{
        ${navLinkFields}
      }
    },
    legalNavItems[]{
      ${navLinkFields}
    },
    instagramLabel,
    googleProfileLabel
  }
`);

// CMS-wiring pass: one projection per <main> section
// (src/app/[locale]/page.tsx), in page order. Images stay as the raw
// Sanity image object (components resolve them via urlFor, same as
// siteSettings.author.photo already does) except video, resolved straight
// to a URL like before — nothing else needs the asset document.
// Chi sono section pass: standalone singleton (see chiSonoSection.ts's own
// comment for why this isn't a homePage field group), so it's its own
// query rather than another projection inside homePageQuery below.
// "portraitLqip" mirrors qualificationsQuery/homePageQuery's diplomi.items
// pattern — the lightbox-less blur placeholder for the portrait's own
// next/image.
export const chiSonoSectionQuery = defineQuery(`
  *[_type == "chiSonoSection" && language == $locale][0]{
    kicker,
    title,
    titleEmphasisWord,
    paragraphs,
    pullQuote,
    portrait,
    "portraitLqip": portrait.asset->metadata.lqip,
    storyLink,
    signatureEnabled
  }
`);

// Aree section pass: header copy (standalone singleton, see
// areeSection.ts's own comment) and the row list (standalone `area` list
// type, see its own comment for why rows aren't nested inside the
// singleton) are two separate queries, fetched together.
export const areeSectionQuery = defineQuery(`
  *[_type == "areeSection" && language == $locale][0]{
    kicker,
    title,
    intro,
    previewHover
  }
`);

export const areasQuery = defineQuery(`
  *[_type == "area" && language == $locale] | order(order asc) {
    _id,
    title,
    descriptor,
    "slug": slug.current
  }
`);

export const homePageQuery = defineQuery(`
  *[_type == "homePage" && language == $locale][0]{
    title,
    hero{
      headline,
      headlineEmphasisWord,
      positioningStatement,
      ctaLabel,
      photo,
      youtubeId
    },
    chiSono,
    formazione,
    diCosa,
    diplomi{
      kicker,
      heading,
      alboLine,
      items[]{
        _key,
        year,
        title,
        institution,
        tier,
        document,
        "documentLqip": document.asset->metadata.lqip
      }
    },
    percorso,
    recognition{
      kicker,
      heading,
      bridgeLine,
      fragments[]{
        label,
        text,
        emphasisWord,
        tier
      }
    },
    hope,
    sedi,
    prezzi,
    risorse,
    video{
      kicker,
      heading,
      lead,
      "videoUrl": file.asset->url,
      poster,
      "captionsUrl": captions.asset->url
    },
    finalCta,
    faq{
      kicker,
      heading,
      linkLabel,
      items[]->{ _id, question, answer }
    },
    seo
  }
`);

// Sedi section's scene list — replaces sediData.ts. Not locale-scoped by
// the section itself (sede documents are still it/en pairs like everything
// else, filtered the normal way).
export const sedesQuery = defineQuery(`
  *[_type == "sede" && language == $locale] | order(order asc) {
    _id,
    city,
    isOnline,
    onlineLine,
    addresses,
    order
  }
`);

// Diplomi section's list — replaces diplomiData.ts. Superseded by
// qualificationsQuery below for the card-row rebuild; left as-is (still
// queries the `diploma` type, which is itself a disclosed orphan — see
// qualification.ts's own comment) since nothing currently calls it.
export const diplomasQuery = defineQuery(`
  *[_type == "diploma" && language == $locale] | order(order asc) {
    _id,
    image,
    title,
    institution,
    year
  }
`);

// Diplomi rebuild — card row + lightbox. Superseded by homePageQuery's own
// diplomi{items[]} projection above (homePage-array migration pass, owner
// call — see homePage.ts's own comment); left as-is since nothing
// currently calls it, same disclosed-orphan precedent as diplomasQuery
// right above. "document.asset->metadata.lqip" is the lightbox's blur
// placeholder (a tiny base64 data URI Sanity generates automatically per
// asset, no extra processing needed); the card thumbnail doesn't need its
// own separate lqip fetch since next/image's blur-up only matters for the
// larger lightbox image where load time is actually noticeable.
export const qualificationsQuery = defineQuery(`
  *[_type == "qualification" && language == $locale] | order(order asc) {
    _id,
    year,
    title,
    institution,
    tier,
    document,
    "documentLqip": document.asset->metadata.lqip
  }
`);

// Homepage "concerns grid" — every pillar page, auto-curated (no manual
// reference list to keep in sync as new pillars are added). Excludes
// noIndex ones, same rule as the sitemap.
export const pillarsGridQuery = defineQuery(`
  *[_type == "pillarPage" && language == $locale && seo.noIndex != true] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    "description": seo.metaDescription
  }
`);

// Homepage "latest from the knowledge base" — most recently updated
// pillar/subtopic pages. Deliberately excludes "article" and "service":
// neither has a public route yet (Stage 3+, see SPEC.md), so linking to
// one here would be a dead link, unlike the header nav's not-yet-built
// singleton pages (those at least resolve to the site's own not-found
// page — an article/service reference wouldn't resolve to anything
// generateStaticParams knows about at all).
export const latestContentQuery = defineQuery(`
  *[_type in ["pillarPage", "subtopicPage"] && language == $locale && seo.noIndex != true]
    | order(_updatedAt desc) [0...3] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "parentSlug": parentPillar->slug.current,
    "description": seo.metaDescription
  }
`);

// "Risorse" section (design-lab, Group B pass). The article schema
// currently has no cover image or category/tag field (Stage 3+, own
// schema review — not changed here) and no public route exists yet to
// link to (same gap latestContentQuery's comment above already notes for
// article/service) — see ResourcesSection.tsx's file-level comment for
// how the design-lab page covers both gaps meanwhile with lab-only mock
// data layered on top of whatever this query actually returns.
export const latestArticlesQuery = defineQuery(`
  *[_type == "article" && language == $locale] | order(publishedAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    publishedAt
  }
`);

export const pillarPageQuery = defineQuery(`
  *[_type == "pillarPage" && language == $locale && slug.current == $slug][0]{
    _id,
    title,
    ${bodyProjection},
    seo,
    medicalEntityType,
    ${alternatesProjection}
  }
`);

export const pillarSlugsQuery = defineQuery(`
  *[_type == "pillarPage" && language == $locale]{ "slug": slug.current }
`);

export const subtopicPageQuery = defineQuery(`
  *[
    _type == "subtopicPage" &&
    language == $locale &&
    slug.current == $slug &&
    parentPillar->slug.current == $pillarSlug
  ][0]{
    _id,
    title,
    "parentPillarTitle": parentPillar->title,
    ${bodyProjection},
    seo,
    medicalEntityType,
    ${alternatesProjection}
  }
`);

// generateStaticParams for [subtopicSlug] only receives {locale} from its
// real ancestor chain ([locale]/layout.tsx) — Next.js chains params through
// layouts, not through a sibling page.tsx's own generateStaticParams to a
// nested child route — so this returns pillarSlug+subtopicSlug together
// rather than relying on pillarSlug being passed in.
export const allSubtopicSlugsQuery = defineQuery(`
  *[_type == "subtopicPage" && language == $locale]{
    "pillarSlug": parentPillar->slug.current,
    "subtopicSlug": slug.current
  }
`);

// --- sitemap.xml (Step 5) -----------------------------------------------
// Not locale-scoped: sitemap.ts runs once and emits entries for every
// language itself, each with reciprocal hreflang alternates (same
// mechanism as generateMetadata's canonical/hreflang, Step 3).
// seo.noIndex != true reads as "true" only for an explicit noIndex, so
// documents without an seo object at all are still included by default.

export const sitemapHomePagesQuery = defineQuery(`
  *[_type == "homePage" && seo.noIndex != true]{
    language,
    _updatedAt
  }
`);

export const sitemapPillarsQuery = defineQuery(`
  *[_type == "pillarPage" && seo.noIndex != true]{
    language,
    "slug": slug.current,
    _updatedAt,
    ${alternatesProjection}
  }
`);

export const sitemapSubtopicsQuery = defineQuery(`
  *[_type == "subtopicPage" && seo.noIndex != true]{
    language,
    "slug": slug.current,
    "parentSlug": parentPillar->slug.current,
    _updatedAt,
    ${alternatesProjection}
  }
`);
