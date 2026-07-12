import type { DocumentLocationResolvers } from "sanity/presentation";
import { defineLocations } from "sanity/presentation";
import { homePath, pillarPath, subtopicPath } from "./paths";

// Maps a document to the frontend URL that renders it, so clicking a
// document in Studio jumps the Presentation preview to the right page.
export const presentationLocations: DocumentLocationResolvers = {
  homePage: defineLocations({
    select: { title: "title", language: "language" },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title ?? "Home",
          href: homePath(doc?.language === "en" ? "en" : "it"),
        },
      ],
    }),
  }),
  pillarPage: defineLocations({
    select: { title: "title", language: "language", slug: "slug.current" },
    resolve: (doc) =>
      doc?.slug
        ? {
            locations: [
              {
                title: doc.title ?? "Pillar page",
                href: pillarPath(
                  doc.language === "en" ? "en" : "it",
                  doc.slug,
                ),
              },
            ],
          }
        : null,
  }),
  subtopicPage: defineLocations({
    select: {
      title: "title",
      language: "language",
      slug: "slug.current",
      parentSlug: "parentPillar->slug.current",
    },
    resolve: (doc) =>
      doc?.slug && doc?.parentSlug
        ? {
            locations: [
              {
                title: doc.title ?? "Subtopic page",
                href: subtopicPath(
                  doc.language === "en" ? "en" : "it",
                  doc.parentSlug,
                  doc.slug,
                ),
              },
            ],
          }
        : null,
  }),
  // sede/diploma/faqItem have no page route of their own — they only ever
  // render embedded in the homepage, so editing one jumps Presentation to
  // "/" (IT). Unconditionally IT for now since the homepage's own EN
  // variant redirects to IT while the temporary EN gate stands (see
  // src/app/[locale]/page.tsx) — revisit once that gate lifts.
  sede: defineLocations({
    select: { title: "city" },
    resolve: (doc) => ({
      locations: [{ title: doc?.title ?? "Sede", href: homePath("it") }],
    }),
  }),
  diploma: defineLocations({
    select: { title: "title" },
    resolve: (doc) => ({
      locations: [{ title: doc?.title ?? "Diploma", href: homePath("it") }],
    }),
  }),
  faqItem: defineLocations({
    select: { title: "question" },
    resolve: (doc) => ({
      locations: [{ title: doc?.title ?? "FAQ item", href: homePath("it") }],
    }),
  }),
  // CMS-driven header/footer pass: headerSettings/footerSettings have no
  // route of their own either (site-wide chrome, not a page) — same
  // "jump to the homepage" pattern as sede/diploma/faqItem above, same
  // unconditional-IT reasoning (the homepage's own EN variant redirects
  // to IT while the temporary EN gate stands).
  headerSettings: defineLocations({
    select: { language: "language" },
    resolve: (doc) => ({
      locations: [{ title: "Header", href: homePath(doc?.language === "en" ? "en" : "it") }],
    }),
  }),
  footerSettings: defineLocations({
    select: { language: "language" },
    resolve: (doc) => ({
      locations: [{ title: "Footer", href: homePath(doc?.language === "en" ? "en" : "it") }],
    }),
  }),
};
