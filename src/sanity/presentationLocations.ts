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
};
