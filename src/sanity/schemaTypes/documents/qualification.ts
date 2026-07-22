import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// Diplomi rebuild pass: replaces the `diploma` document type entirely for
// the new card-row + lightbox composition (`diploma`'s own documents are
// left untouched as a disclosed orphan — same precedent as every other
// schema migration in this codebase, e.g. recognition.vignettes,
// percorso's old `description` field — nothing deleted, just no longer
// referenced by any live query/component). Field shape differs from
// `diploma`'s own (year as a display STRING here, not a number — some
// entries may eventually need "2019–2020"-style ranges; `document`, not
// `image`, since it's a scanned certificate, not a photo; new `tier`
// field distinguishes a formal titolo from a formazione continua entry,
// stored now for future filtering/grouping but NOT rendered differently
// in this pass, per spec — single row only).
// DEPRECATED (owner call, homePage-array migration pass): superseded by
// homePage.diplomi.items — see that field's own comment in homePage.ts.
// hidden: true removes this from the Studio structure tree, global
// search, and "create new" menu (so no one keeps editing these dead
// copies) without touching the existing documents — same orphan-not-
// delete precedent as `diploma` before it, just with the hidden flag
// this pass explicitly asked for on top.
export const qualification = defineType({
  name: "qualification",
  title: "Qualification (deprecated — see homePage.diplomi.items)",
  type: "document",
  hidden: () => true,
  fields: [
    defineField({
      name: "year",
      title: "Year",
      description: 'Display string, not a number — e.g. "2011" or a future "2019–2020" range.',
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    defineField({
      name: "institution",
      title: "Institution",
      type: "string",
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    defineField({
      name: "tier",
      title: "Tier",
      description: "Stored for future grouping/filtering — this pass renders every tier identically in a single row.",
      type: "string",
      options: {
        list: [
          { title: "Titolo (degree/formal qualification)", value: "titolo" },
          { title: "Formazione continua (continuing education)", value: "formazione_continua" },
        ],
      },
      initialValue: "titolo",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "document",
      title: "Scanned document",
      description: "Optional — leave empty until the redacted scan is ready. Cards without one show a typographic placeholder instead of a broken image.",
      type: "image",
      options: { hotspot: false },
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
    select: { title: "title", subtitle: "institution", media: "document" },
  },
});
