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
    seo
  }
`);

export const homePageQuery = defineQuery(`
  *[_type == "homePage" && language == $locale][0]{
    title,
    ${bodyProjection},
    seo
  }
`);

export const pillarPageQuery = defineQuery(`
  *[_type == "pillarPage" && language == $locale && slug.current == $slug][0]{
    _id,
    title,
    ${bodyProjection},
    seo,
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
    ${bodyProjection},
    seo,
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
