import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Originally replaced src/components/diplomiData.ts's hardcoded Diploma[]
// array. width/height (that file's own intrinsic-size fields, needed for
// the lightbox's layout) aren't modeled here — Sanity image assets carry
// their own dimensions via the asset metadata, so the component read
// those instead of storing them redundantly in the schema.
//
// DEPRECATED, twice over: superseded first by `qualification` (see that
// file's own header) and then, with it, by homePage.diplomi.items, which
// is what the home page has actually rendered since the homePage-array
// migration. Neither diplomasQuery nor qualificationsQuery is imported by
// anything.
//
// `qualification` was given hidden + a deprecated title when it was
// superseded; this type was missed, so it kept a live "Diplomi" row under
// Reference data in Studio, holding seeded placeholder documents. The
// owner found it and asked why editing them changed nothing on the site.
// hidden: true removes it from the structure tree, global search and the
// "create new" menu without touching the documents themselves — the same
// orphan-not-delete precedent every schema migration in this codebase
// follows. The type stays in TRANSLATABLE_TYPES (structure.ts) so those
// orphaned it/en pairs stay valid.
//
// NOT reflected in the owner's manual, deliberately (owner call): the
// manual has a paragraph explaining this row away, and the Italian .docx
// source isn't in the repo — only its PDF — so the two language versions
// could not be rebuilt in step, which docs/owner-manual's own rule
// requires.
export const diploma = defineType({
  name: "diploma",
  title: "Diploma (deprecated — see homePage.diplomi.items)",
  type: "document",
  hidden: () => true,
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: false },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "institution",
      title: "Institution",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    languageField(),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "institution", media: "image" },
  },
});
