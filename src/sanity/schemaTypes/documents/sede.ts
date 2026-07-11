import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Replaces src/components/sediData.ts's hardcoded sedeScenes array.
// Deliberately separate from locationPage (which is protected/singleton-
// like, "exactly two: Milan, Monza", and models a single address string for
// dedicated location landing pages) — a sede can hold multiple addresses
// under one city (e.g. two partner centers in Milano) plus map coordinates,
// which locationPage has no fields for. Plain list type, not singleton/
// protected — there's no "exactly N" constraint here.
export const sede = defineType({
  name: "sede",
  title: "Sede",
  type: "document",
  fields: [
    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isOnline",
      title: "Online scene",
      description: "On for the single 'online' scene (no physical addresses) — addresses below stay empty and onlineLine is shown instead.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "onlineLine",
      title: "Online description",
      description: "Shown only when \"Online scene\" is on.",
      type: "text",
      rows: 2,
      hidden: ({ parent }) => !parent?.isOnline,
    }),
    defineField({
      name: "addresses",
      title: "Addresses",
      description: "One or more physical addresses for this city (e.g. multiple partner centers).",
      type: "array",
      of: [
        {
          type: "object",
          name: "sedeAddress",
          fields: [
            defineField({
              name: "centerName",
              title: "Center name (optional)",
              type: "string",
            }),
            defineField({
              name: "address",
              title: "Street address",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "lat",
              title: "Latitude",
              type: "number",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "lng",
              title: "Longitude",
              type: "number",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "centerName", subtitle: "address" } },
        },
      ],
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
    select: { title: "city", isOnline: "isOnline" },
    prepare: ({ title, isOnline }) => ({ title, subtitle: isOnline ? "Online" : undefined }),
  },
});
