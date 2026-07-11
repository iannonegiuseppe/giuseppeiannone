import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Replaces src/components/diplomiData.ts's hardcoded Diploma[] array.
// width/height (the hardcoded file's own intrinsic-size fields, needed for
// the lightbox's layout) aren't modeled here — Sanity image assets carry
// their own dimensions via the asset metadata, so the component reads
// those instead of storing them redundantly in the schema.
export const diploma = defineType({
  name: "diploma",
  title: "Diploma",
  type: "document",
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
