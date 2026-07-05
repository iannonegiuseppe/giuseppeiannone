import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Site title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Site description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact phone",
      type: "string",
    }),
    defineField({
      name: "seo",
      title: "Default SEO",
      type: "seo",
    }),
    defineField({
      name: "author",
      title: "Author",
      description:
        "The site's single author/practitioner identity. Translated as part of this document's it/en pair, like everything else in Site settings.",
      type: "object",
      fields: [
        defineField({
          name: "name",
          title: "Name",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "credentials",
          title: "Credentials",
          description: 'Professional title, e.g. "Psicologa Psicoterapeuta"',
          type: "string",
        }),
        defineField({
          name: "registrationNumber",
          title: "Registration number",
          description:
            "Professional register enrollment number (Albo degli Psicologi)",
          type: "string",
        }),
        defineField({
          name: "bio",
          title: "Bio",
          type: "text",
          rows: 4,
        }),
        defineField({
          name: "photo",
          title: "Photo",
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
    }),
    languageField(),
  ],
});
