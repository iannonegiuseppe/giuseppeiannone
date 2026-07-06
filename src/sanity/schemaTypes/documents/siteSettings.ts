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
      name: "whatsappNumber",
      title: "WhatsApp number",
      description:
        'Full number with country code (e.g. "+39 000 0000000"). This is a ' +
        "contact channel, not a social profile — deliberately not part of " +
        "socialLinks below. Code derives the wa.me link from this so an " +
        "editor never has to construct or paste a URL correctly.",
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
    defineField({
      name: "crisisSupportText",
      title: "Crisis support line",
      description:
        "Deontology-required footer text (Italian emergency reference, e.g. 112). Must never be empty — this is not optional editorial content.",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "googleProfileUrl",
      title: "Google profile URL",
      description:
        "Optional outbound link only (no reviews widget, no API integration). Footer link is hidden entirely when this is empty.",
      type: "url",
    }),
    defineField({
      name: "socialLinks",
      title: "Social profiles",
      description:
        "Used for JSON-LD sameAs (Stage 2 Step 4). Leave blank until real profiles exist — omitted entirely from structured data when empty.",
      type: "object",
      fields: [
        defineField({ name: "instagram", title: "Instagram URL", type: "url" }),
        defineField({ name: "linkedin", title: "LinkedIn URL", type: "url" }),
        defineField({ name: "facebook", title: "Facebook URL", type: "url" }),
      ],
    }),
    languageField(),
  ],
});
