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
    emergencyContacts,
    googleProfileUrl,
    carePathway,
    pricing
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
  isPillarTaxonomy,
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

// Header nav restructure pass — "Aree"'s dropdown content: real
// pillarPage/subtopicPage documents, grouped by pillar. Queried live and
// grouped in code (src/sanity/areaTaxonomy.ts), never typed into
// headerSettings.navItems as a second copy — see navLink.ts's own
// isPillarTaxonomy field for why. Subtopics ordered alphabetically by
// title, the same convention structure.ts's own pillarWithSubtopics desk
// helper already uses for the identical "subtopics under one pillar"
// listing — no separate ordering scheme invented for this one query.
export const areaTaxonomyQuery = defineQuery(`
  *[_type == "pillarPage" && language == $locale]{
    _id,
    title,
    "slug": slug.current,
    "subtopics": *[_type == "subtopicPage" && language == $locale && parentPillar._ref == ^._id] | order(title asc) {
      title,
      "slug": slug.current
    }
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
    heroStandfirst,
    heroLocations,
    whatIWorkWith,
    glassCard,
    parallaxDivider,
    howIWork,
    credentials,
    bodyBlocks,
    journey,
    timeline,
    publications,
    paragraphs,
    pullQuote,
    pullQuoteFollowUp,
    portrait,
    "portraitLqip": portrait.asset->metadata.lqip,
    storyLink,
    signatureEnabled,
    seo
  }
`);

// Chi sono opening pass — the "Di cosa mi occupo" area mosaic. Derived
// live from pillarPage documents, not authored on chiSonoSection itself
// (see that field group's own schema comment) — a new area appears here
// automatically, nothing to update on this page when one ships.
// subtopicCount is only ever rendered for the anxiety tile today (see
// AreaMosaic.tsx), but computed for every pillar here rather than special-
// cased in the query, so it's already correct if that changes later.
export const chiSonoMosaicQuery = defineQuery(`
  *[_type == "pillarPage" && language == $locale]{
    _id,
    title,
    "slug": slug.current,
    heroImage,
    "subtopicCount": count(*[_type == "subtopicPage" && language == $locale && parentPillar._ref == ^._id])
  }
`);

// Chi sono build pass — the qualifications section on /chi-sono, /en/
// about-me reuses homePage.diplomi.* verbatim (the same real qualification
// list already shown on the homepage; not new content, so not part of
// the paragraph-overlap concern the page's own body copy has to avoid).
// Narrow-select, same convention as contactSectionQuery just above —
// this route has no use for the rest of homePage's fields.
export const chiSonoDiplomiQuery = defineQuery(`
  *[_type == "homePage" && language == $locale][0]{
    diplomi{
      kicker,
      heading,
      headingEmphasisWord,
      intro,
      alboLine,
      items[]{
        _key,
        year,
        title,
        institution,
        tier,
        document,
        "documentLqip": document.asset->metadata.lqip,
        scan,
        scanRedacted,
        "scanLqip": scan.asset->metadata.lqip
      }
    }
  }
`);

// Blog article pass — the author block's avatar. A narrow query (just the
// one field) rather than reusing chiSonoSectionQuery wholesale: that query
// pulls kicker/title/paragraphs/pullQuote/etc the article page has no use
// for. siteSettings.author has its own `photo` field in the schema, but no
// image is uploaded there yet (checked directly against the dataset,
// report) — this reuses chiSonoSection's real, already-live portrait
// instead of inventing a path or leaving the avatar broken.
// Also carries `paragraphs` now (article end-of-body author section,
// seventh pass, item 4) — same document/tag as the portrait fetch above,
// so this stays one query rather than a second round-trip. Bio text is
// built from these paragraphs in code (see page.tsx's own comment), never
// invented here or hardcoded in a component.
export const chiSonoPortraitQuery = defineQuery(`
  *[_type == "chiSonoSection" && language == $locale][0]{
    portrait,
    "portraitLqip": portrait.asset->metadata.lqip,
    paragraphs
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

export const ctaBridgeSectionQuery = defineQuery(`
  *[_type == "ctaBridgeSection" && language == $locale][0]{
    title,
    titleEmphasis,
    body,
    linkLabel
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
      youtubeId,
      "backgroundVideoDesktopUrl": backgroundVideoDesktop.asset->url,
      "backgroundVideoMobileUrl": backgroundVideoMobile.asset->url,
      backgroundVideoPoster
    },
    chiSono,
    aree{
      kicker,
      title,
      intro,
      items[]{
        _key,
        title,
        descriptor
      }
    },
    ctaBridge{
      title,
      titleEmphasis,
      body,
      linkLabel
    },
    formazione,
    diCosa,
    diplomi{
      kicker,
      heading,
      headingEmphasisWord,
      intro,
      alboLine,
      items[]{
        _key,
        year,
        title,
        institution,
        tier,
        document,
        "documentLqip": document.asset->metadata.lqip,
        scan,
        scanRedacted,
        "scanLqip": scan.asset->metadata.lqip
      }
    },
    percorso,
    metodo,
    tariffe,
    profilo,
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
    welcome,
    credentialsBand,
    sedi,
    sediLab,
    spaziLab,
    locations,
    spaces,
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
    contactLab,
    contactSection,
    faq{
      kicker,
      heading,
      linkLabel,
      items[]->{ _id, question, answer }
    },
    seo
  }
`);

// Locations section's data — replaces sediData.ts. Not locale-scoped by
// the section itself (sede documents are still it/en pairs like everything
// else, filtered the normal way). Locations map pass: addresses[] now
// spreads every existing field (...) plus a computed photoLqip per
// address — same "asset->metadata.lqip alongside the raw image field"
// pattern already used by ChiSonoSection's portraitLqip/DiplomiSection's
// documentLqip above.
export const sedesQuery = defineQuery(`
  *[_type == "sede" && language == $locale] | order(order asc) {
    _id,
    city,
    isOnline,
    onlineLine,
    addresses[]{
      ...,
      "photoLqip": photo.asset->metadata.lqip
    },
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

// Risorse pass (design-lab only) — a SEPARATE query, not an extension of
// latestArticlesQuery above: that one is also read by the real
// production homepage (src/app/[locale]/page.tsx), and this pass needs
// two things production doesn't fetch yet (cover, body — the latter only
// to derive an excerpt from, never rendered as body copy here). Three
// most recent only (no featured article anymore) — keeping them
// independent means the production query's own shape/cost never changes
// because of this pass.
export const latestArticlesLabQuery = defineQuery(`
  *[_type == "article" && language == $locale] | order(publishedAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    cover,
    body
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

// Root-namespace pass — src/app/[locale]/[slug]/page.tsx's own resolver.
// One request, both root-level candidates for this slug, rather than two
// sequential fetches (which would also hide a collision — a short-circuit
// "try pillar, then try page" can never observe that BOTH matched). The
// route decides precedence and logs a collision; see that file's own
// comment. "page" is the not-yet-created universal page type (Stage 2
// Step 4 of this pass) — querying for a _type with no schema/documents
// yet is harmless, it just returns null until real documents exist.
export const rootSlugQuery = defineQuery(`
  {
    "pillar": *[_type == "pillarPage" && language == $locale && slug.current == $slug][0]{
      _id,
      title,
      heroImage,
      heroKicker,
      standfirst,
      titleEmphasisWord,
      factsStrip,
      recognition{
        leadInOverride,
        items[]{
          _key,
          quote,
          label,
          "subtopic": subtopic->{
            _id, _type, title, "slug": slug.current,
            "parentSlug": parentPillar->slug.current
          }
        }
      },
      "faqItems": faqItems[]->{ _id, question, answer },
      "relatedArticles": relatedArticles[]->{
        _id, title, "slug": slug.current, cover, publishedAt
      },
      ${bodyProjection},
      seo,
      medicalEntityType,
      ${alternatesProjection}
    },
    "page": *[_type == "page" && language == $locale && slug.current == $slug][0]{
      _id,
      title,
      ${bodyProjection},
      seo,
      ${alternatesProjection}
    }
  }
`);

// Same "page" type — always empty until Step 4 of this pass adds the
// schema, unioned with pillarSlugsQuery by generateStaticParams below.
export const pageSlugsQuery = defineQuery(`
  *[_type == "page" && language == $locale]{ "slug": slug.current }
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
    heroImage,
    heroKicker,
    standfirst,
    titleEmphasisWord,
    epigraph,
    "faqItems": faqItems[]->{ _id, question, answer },
    ${bodyProjection},
    seo,
    medicalEntityType,
    ${alternatesProjection},
    // Language-switching fallback pass — a subtopic's OWN alternates
    // above cover the "real counterpart exists" case (4 of 21 pairs
    // today); this is for the other 17, so the switcher can fall back to
    // the parent pillar's page in the other locale instead of the
    // homepage. Confirmed live via a standalone query before wiring this
    // in: parentPillar->{ ... } correctly re-scopes ^ to the dereferenced
    // pillar doc, same as alternatesProjection's own ^._id does when used
    // directly on a filtered document.
    "parentPillarAlternates": parentPillar->{
      "alternates": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
        language,
        "slug": value->slug.current
      }
    }.alternates
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

// --- Blog (WordPress migration pass) ------------------------------------
// Article routes: /blog listing (paginated) + /blog/[slug].

export const articleSlugsQuery = defineQuery(`
  *[_type == "article" && language == $locale]{ "slug": slug.current }
`);

export const articleBySlugQuery = defineQuery(`
  *[_type == "article" && language == $locale && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    cover,
    excerpt,
    tags,
    ${bodyProjection},
    seo,
    ${alternatesProjection}
  }
`);

// Language-switching pass — pairing by slug match, not translation.metadata:
// articles have zero of those documents for any of the 468+5 that exist
// today (confirmed live), and creating one per pair doesn't generalize —
// every future article pair would need a human to remember a second
// authoring step, where matching slugs already IS the article corpus's own
// stated pairing convention (see contents/blog-en-cinque-articoli.md's own
// "Slugs mirror the Italian ones exactly"). Existence-only projection — the
// route just needs to know whether $slug exists in $otherLocale, not fetch
// its content.
export const articleCounterpartQuery = defineQuery(`
  *[_type == "article" && language == $otherLocale && slug.current == $slug][0]{
    "slug": slug.current
  }
`);

// Paginated listing: $start/$end are a GROQ slice range (0-indexed,
// end-exclusive), computed by the route from the page number + page size.
export const articlesPageQuery = defineQuery(`
  *[_type == "article" && language == $locale] | order(publishedAt desc) [$start...$end]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    cover,
    excerpt
  }
`);

export const articlesCountQuery = defineQuery(`
  count(*[_type == "article" && language == $locale])
`);

// End-of-article pass — "3 most recent, excluding this one." No
// category/tag-based relation: 370 of 468 imported articles have no tags
// at all (confirmed via a direct dataset query, this pass's own report),
// so a tag-matching approach would silently fail for most articles. This
// query can never come up empty the way a real similarity match could —
// flagged in the report, not silently relied on.
export const relatedArticlesQuery = defineQuery(`
  *[_type == "article" && language == $locale && slug.current != $excludeSlug]
    | order(publishedAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    cover,
    publishedAt
  }
`);

// End-of-article pass — reuses the real, editor-authored contactSection
// copy the homepage's own ContactBlock renders (kicker/heading/
// headingEmphasisWord/photoCaption), rather than inventing new marketing
// copy for this one section. Real bug caught in a later pass: this
// originally read "contactLab", a field the schema itself marks
// "DEPRECATED, see contactSection" (homePage.ts's own comment) — fixed
// here to match what ContactBlock actually renders on the live homepage.
// finalCta.googleProfileLabel travels alongside it since ContactBlock
// still reads that one field from the older group (see page.tsx's own
// comment on that specific carry-over). Narrow query (just these two
// field groups) rather than the full homePageQuery, which pulls far more
// than this needs.
export const contactSectionQuery = defineQuery(`
  *[_type == "homePage" && language == $locale][0]{
    contactSection,
    "googleProfileLabel": finalCta.googleProfileLabel
  }
`);

// Prezzi build pass — pricePage is a defineSimplePageType singleton
// (title + portableText body + seo, nothing else), same narrow-select
// shape as every other singleton query here.
const pricePageServiceLinksProjection = `
  links[]{
    label,
    "target": target->{ _id, _type, "slug": slug.current, title }
  }
`;

const pricePageServiceProjection = `
  {
    title,
    paragraph1,
    derivedNote,
    linkPrefix,
    ${pricePageServiceLinksProjection},
    linkSuffix
  }
`;

// Metodo build pass — methodPage is a real document now (see that schema
// file's own comment for why it grew out of defineSimplePageType). Every
// field is a flat/nested-object projection (no dereferences needed) — same
// narrow, explicit-field convention as contactPageQuery above, not a bare
// \`...\` spread.
export const methodPageQuery = defineQuery(`
  *[_type == "methodPage" && language == $locale][0]{
    kicker,
    title,
    titleEmphasisWord,
    lead,
    split,
    path,
    relationship,
    approach,
    fitEnding,
    practical,
    seo
  }
`);

export const pricePageQuery = defineQuery(`
  *[_type == "pricePage" && language == $locale][0]{
    title,
    ${bodyProjection},
    servicesHeading,
    servicesIntro,
    services{
      "individual": individual${pricePageServiceProjection},
      "couple": couple${pricePageServiceProjection},
      "sexology": sexology${pricePageServiceProjection},
      "online": online${pricePageServiceProjection}
    },
    darkBand,
    facts,
    seo
  }
`);

// FAQ page build pass — faqPage is a real document now (title/intro/
// sections/seo). "sections[].items" dereferences straight to the real
// faqItem fields (question/answer) the accordion needs — same "expand
// the reference at query time" shape pillarPage.faqItems/subtopicPage.
// faqItems already use, not a second round-trip per section.
export const faqPageQuery = defineQuery(`
  *[_type == "faqPage" && language == $locale][0]{
    title,
    titleEmphasisWord,
    intro,
    photo,
    sections[]{
      _key,
      title,
      description,
      items[]->{ _id, question, answer }
    },
    seo
  }
`);

// Contatti build pass — contactPage is a real document now (see that
// schema file's own comment for why it grew out of defineSimplePageType).
// Every field is a flat/object projection (no dereferences needed) —
// `...` isn't used here so an editor adding a stray field later doesn't
// silently start rendering somewhere unexpected.
// Lead-expansion pass — intro is now portable-text blocks; markDefs[]
// dereferences pillarLink's own "target" reference the same way
// bodyProjection's own custom-block entries do above (_type == "x" =>
// {...}) — one projection per mark type, not a generic catch-all.
export const contactPageQuery = defineQuery(`
  *[_type == "contactPage" && language == $locale][0]{
    kicker,
    title,
    titleEmphasisWord,
    intro[]{
      ...,
      markDefs[]{
        ...,
        _type == "pillarLink" => {
          "target": target->{ _id, _type, "slug": slug.current, title }
        }
      }
    },
    whatsapp,
    phone,
    email,
    hours,
    appointments,
    sediKicker,
    sediHeading,
    online,
    seo
  }
`);

// Privacy/cookie policy pass — both defineSimplePageType singletons
// (title + lastUpdated + body + seo). contentTable needs no dereference
// entry in bodyProjection: unlike faqBlock/relatedTopics/conditionCard/
// treatmentCard, its headerRow/rows/cells are plain strings, no `->`
// references, so the projection's own leading `...` already returns it in
// full.
export const privacyPageQuery = defineQuery(`
  *[_type == "privacyPage" && language == $locale][0]{
    title,
    lastUpdated,
    ${bodyProjection},
    seo
  }
`);

export const cookiePolicyPageQuery = defineQuery(`
  *[_type == "cookiePolicyPage" && language == $locale][0]{
    title,
    lastUpdated,
    ${bodyProjection},
    seo
  }
`);

// Libri build pass — libriPage is a real document (see that schema
// file's own comment for why it grew out of defineSimplePageType, same
// call as pricePage/contactPage). Six named chapter fields projected by
// name (not a spread) so a future stray field doesn't silently start
// rendering — same discipline contactPageQuery above already applies.
export const libriPageQuery = defineQuery(`
  *[_type == "libriPage" && language == $locale][0]{
    kicker,
    title,
    titleEmphasisWord,
    lead,
    indexKicker,
    indexTitle,
    indexTitleEmphasisWord,
    indexLead,
    chapter1,
    chapter2,
    chapter3,
    chapter4,
    chapter5,
    chapter6,
    coverTitle,
    metaLine,
    guideCoverImage,
    "guidePdfUrl": guidePdf.asset->url,
    form,
    book,
    seo
  }
`);

// Blog index redesign pass — hero + closing editorial copy for the /blog
// listing (its own singleton, blogIndexSection.ts).
export const blogIndexQuery = defineQuery(`
  *[_type == "blogIndexSection" && language == $locale][0]{
    kicker,
    heading,
    headingEmphasisWord,
    intro,
    editorial,
    seo
  }
`);

// Blog index hero's own visual element — reuses the homepage hero's real
// cut-out portrait (homePage.hero.photo, a transparent PNG; confirmed via
// a direct dataset query that this asset is only referenced by
// homePage-it/-en, not a separate "contact block" asset — the contact
// section's own photo is a hardcoded design-lab path, not a Sanity image
// at all). Narrow query, just this one field, rather than the full
// homePageQuery.
export const heroPortraitQuery = defineQuery(`
  *[_type == "homePage" && language == $locale][0]{
    "photo": hero.photo
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

// Sitemap pass — articles, the /blog listing itself, and the universal
// page type. Same seo.noIndex != true / alternatesProjection pattern as
// the three queries above; pagination pages (/blog/page/2..N) are
// deliberately NOT queried here — no single document owns their
// lastModified (see this pass's own report).
export const sitemapArticlesQuery = defineQuery(`
  *[_type == "article" && seo.noIndex != true]{
    language,
    "slug": slug.current,
    _updatedAt,
    ${alternatesProjection}
  }
`);

// blogIndexSection is the /blog, /en/blog listing's own singleton (hero +
// editorial copy) — its _updatedAt is the honest lastModified source for
// that one URL, same "the document IS the page" reasoning homePage's own
// sitemap query already uses. Not a stand-in for "an article changed" —
// see this pass's own report on why pagination pages aren't included.
export const sitemapBlogIndexQuery = defineQuery(`
  *[_type == "blogIndexSection" && seo.noIndex != true]{
    language,
    _updatedAt
  }
`);

export const sitemapPagesQuery = defineQuery(`
  *[_type == "page" && seo.noIndex != true]{
    language,
    "slug": slug.current,
    _updatedAt,
    ${alternatesProjection}
  }
`);
