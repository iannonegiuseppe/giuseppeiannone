import { defineField, defineType } from "sanity";
import { SlugLockedAfterPublish } from "../../components/SlugLockedAfterPublish";
import { languageField } from "../lib/languageField";

// No author reference: there's exactly one author (the singleton), so the
// byline renders from it automatically at the frontend, not per-document.
export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
      components: { input: SlugLockedAfterPublish },
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      description:
        "Used on the homepage resources index and the article listing. Giuseppe's existing blog articles already have cover photos — this is where they get migrated to.",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableText",
    }),
    // WordPress migration pass — WordPress's own authored excerpt
    // (excerpt.rendered), not a truncation of body: those are written
    // summaries and truncating body loses them. Optional — nothing
    // upstream requires it yet.
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    // WordPress migration pass — WordPress's own tags (post_tag taxonomy),
    // imported wholesale (all ~86, not just the frequently-used ones);
    // filtering/display decisions happen at render time, not at import
    // time. WordPress's own categories are NOT modeled here: 467 of 468
    // posts sit in one category, not a real taxonomy.
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    languageField(),
  ],
});
