import { defineField, defineType } from "sanity";
import { SlugLockedAfterPublish } from "../../components/SlugLockedAfterPublish";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";
import { rootSlugCollisionCheck } from "../lib/rootSlugValidator";

// Root-namespace pass — the universal page type: title + slug + body +
// seo, nothing else. Deliberately this thin, so Giuseppe can create a
// simple page himself (e.g. a page about his book) with no schema change
// and no deploy. Existing bespoke pages (aboutPage/methodPage/pricePage/
// contactPage, via simplePage.ts) keep their own dedicated types for
// anything that needs more structure than this.
//
// `body` reuses the SAME shared `portableText` object type article/
// pillarPage/subtopicPage/service/the simple pages all use — not a
// narrower one like blogIndexSection's own "editorial" array. That
// means keyTakeaways/faqBlock/ctaBlock/relatedTopics/conditionCard/
// treatmentCard are all available here automatically, at zero extra
// schema cost, exactly as proposed.
//
// Shares its URL segment (/{slug}) with pillarPage —
// src/app/[locale]/[slug]/page.tsx resolves both from one route. See
// that file and rootSlugValidator.ts's own comments for how the two are
// kept from colliding.
//
// §9 deontology check applied to BOTH title and body — a deliberate
// departure from pillarPage/subtopicPage/article/service/the simple
// pages, none of which run their long-form bodies through it. Those
// types have a fixed layout and a defined content strategy behind them;
// this type has neither, by design — it exists specifically so nothing
// has to be reviewed before it ships. That is exactly the situation
// deontologyCheck exists for.
export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required().custom(rootSlugCollisionCheck),
      components: { input: SlugLockedAfterPublish },
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableText",
      validation: (Rule) => Rule.custom(deontologyCheck),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    languageField(),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
