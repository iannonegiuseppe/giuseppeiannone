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
            // Locations map pass: optional district/neighbourhood label
            // (e.g. "Citylife", "Bicocca") shown alongside the address in
            // the list and popup. Plain string, not a special "localized"
            // field type — this whole document is already one half of an
            // it/en pair via document-internationalization (see
            // languageField() below), so a plain string here already gets
            // its own per-language value the same way centerName/address
            // already do; no extra i18n plumbing needed at the field level.
            defineField({
              name: "district",
              title: "District (optional)",
              description: 'Neighbourhood label shown next to the address, e.g. "Citylife", "Bicocca".',
              type: "string",
            }),
            // Locations map pass: optional popup photo — none exist yet
            // (see the Locations section's own report). alt is required
            // once an editor actually sets a photo (Rule.required() only
            // fires when the parent image field itself has a value), same
            // pattern as author.photo above in siteSettings.ts.
            defineField({
              name: "photo",
              title: "Photo (optional)",
              type: "image",
              options: { hotspot: true },
              fields: [
                defineField({
                  name: "alt",
                  title: "Alternative text",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
              ],
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
