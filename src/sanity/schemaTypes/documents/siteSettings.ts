import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
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
      name: "contactChannels",
      title: "Contact channels",
      description:
        "CMS-wiring pass: replaces the old flat contactEmail/contactPhone/" +
        "whatsappNumber scalars (and src/components/contactChannels.ts's " +
        "hardcoded array) — every channel the doctor actually answers on, " +
        "in the order they should render. Only channels published here show " +
        'up anywhere (header CTA popup, mini-contact band, footer) — "only ' +
        'channels he actually answers on get published."',
      type: "array",
      of: [
        {
          type: "object",
          name: "contactChannel",
          fields: [
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "WhatsApp", value: "whatsapp" },
                  { title: "Phone", value: "phone" },
                  { title: "Email", value: "email" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "value",
              title: "Value",
              description:
                'The raw value, not a pre-built URL — e.g. "+39 000 0000000" for ' +
                'WhatsApp/phone, "info@example.com" for email. Code builds the ' +
                "wa.me/tel:/mailto: link from this.",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "order",
              title: "Display order",
              type: "number",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "type" } },
        },
      ],
    }),
    defineField({
      name: "piva",
      title: "P.IVA",
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
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    defineField({
      name: "googleProfileUrl",
      title: "Google profile URL",
      description:
        "Optional outbound link only (no reviews widget, no API integration). Footer link is hidden entirely when this is empty.",
      type: "url",
    }),
    defineField({
      name: "carePathway",
      title: "Care pathway (\"Il percorso\")",
      description:
        'The site\'s signature element — appears on the homepage and, later, ' +
        "the Method page. Kept in one place (not duplicated per page) since " +
        "it's the same structural sequence both times, e.g. primo colloquio → " +
        "valutazione → percorso → verifica. Calm structure, not a marketing " +
        "timeline: each step is a short title + description, no numbers or " +
        "claims beyond describing the step.",
      type: "array",
      of: [
        {
          type: "object",
          name: "pathwayStep",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
              validation: (Rule) => Rule.required().custom(deontologyCheck),
            }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        },
      ],
      validation: (Rule) => Rule.min(2).max(6),
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
