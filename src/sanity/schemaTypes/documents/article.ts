import { defineField, defineType } from "sanity";
import { SlugLockedAfterPublish } from "../../components/SlugLockedAfterPublish";
import { articleAreaCheck, articleAreaOtherCheck } from "../lib/articleAreaValidator";
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
    // Categorisation pass — which of the seven pillars this article belongs
    // to, or an explicit "none of them." Placed here (right after
    // publishedAt, well before body) rather than near tags at the bottom:
    // this is now a required field that blocks publish, so it needs to be
    // one of the first things an editor sees opening the document, not
    // something found by scrolling past the body. See
    // articleAreaValidator.ts's own comment for why this is two fields
    // (area + areaOther) rather than one nullable reference, and for the
    // same-language enforcement.
    defineField({
      name: "area",
      title: "Area",
      description:
        "Which of the seven pillar pages this article belongs to. Must be a pillar page in the same language as this article — the picker below only offers same-language ones. Leave empty only if this article is about something outside the seven areas (see \"Not one of the seven\" below) — one of the two is required.",
      type: "reference",
      to: [{ type: "pillarPage" }],
      options: {
        filter: ({ document }) => ({
          filter: "language == $lang",
          params: { lang: document?.language },
        }),
      },
      hidden: ({ document }) => document?.areaOther === true,
      validation: (Rule) => Rule.custom(articleAreaCheck),
    }),
    defineField({
      name: "areaOther",
      title: "Not one of the seven",
      description:
        "Check this when the article is about something outside the seven pillar areas — bipolar disorder, OCD, addiction, eating disorders, autism, and similar are real, recurring subjects in this corpus that none of the seven cover. An article marked this way is deliberately excluded from every pillar's article list, not miscategorised into the nearest one.",
      type: "boolean",
      initialValue: false,
      validation: (Rule) => Rule.custom(articleAreaOtherCheck),
    }),
    // Blog category-chip pass (round 2) — deliberately separate from
    // area/areaOther above, not a third state of that XOR. A pillar
    // (area) says "this is what I treat"; a blog category says "this is
    // what I have written about" — an article can be areaOther:true and
    // ALSO carry a blogCategory (the 87-odd articles this pass assigns
    // one to are exactly the areaOther pool), or in principle carry both
    // a real pillar AND a blog category later, since nothing here
    // enforces mutual exclusivity the way articleAreaValidator.ts does
    // for area/areaOther. Optional: most articles have no blog category
    // and that's fine — it's a filter convenience, not a required
    // classification the way area/areaOther is.
    defineField({
      name: "blogCategory",
      title: "Blog category",
      description:
        "Optional. A /blog filter-chip grouping only — independent of Area above. Leave empty unless this article belongs to one of the defined blog categories.",
      type: "reference",
      to: [{ type: "blogCategory" }],
      options: {
        filter: ({ document }) => ({
          filter: "language == $lang",
          params: { lang: document?.language },
        }),
      },
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
