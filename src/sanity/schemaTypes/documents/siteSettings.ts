import { defineField, defineType } from "sanity";
import { deontologyCheck, deontologyCheckWithExtraWords } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// Availability-badge pass: on top of the shared §9 list, these three
// status texts specifically forbid scarcity wording — an editor writing
// "waitlist" copy is the single most likely place on this whole site for
// a "solo 2 posti rimasti" style phrase to slip in, since the field's
// entire purpose invites it. "%" is already in the shared FORBIDDEN_WORDS
// list (deontologyValidator.ts), so it's covered without repeating it
// here.
const AVAILABILITY_SCARCITY_WORDS = ["ultimi", "posti limitati", "affrettati", "solo"];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  // No other schema in this project uses Sanity's fieldsets/groups
  // features yet (checked: zero matches project-wide) — introduced here
  // specifically because the spec asks for flat, prefixed field names
  // (availabilityStatus, acceptingText...) rather than a nested object
  // like `author`/`socialLinks` use elsewhere. `fieldsets` groups them
  // visually in the Studio form without changing the data shape; no
  // separate desk-structure entry is needed since these are just new
  // fields on the existing siteSettings singleton.
  fieldsets: [
    {
      name: "availability",
      title: "Availability",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Site title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      description:
        'Brand mark shared by both the header and the footer. Optional — when empty, both render the existing text wordmark ("Giuseppe Iannone", Marcellus) instead. Alt text is fixed to "Giuseppe Iannone" regardless of what the image shows (accessibility + SEO — the logo must carry the name even as an image), not editable per-upload.',
      type: "image",
      options: { hotspot: true },
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
      name: "availabilityStatus",
      title: "Availability status",
      description:
        "Drives the availability badge (hero, contact popup, final CTA). " +
        "Information for the visitor, not a scarcity device — see the " +
        "status text fields below.",
      type: "string",
      fieldset: "availability",
      options: {
        layout: "radio",
        list: [
          { title: "Accepting new patients", value: "accepting" },
          { title: "Waitlist / limited", value: "waitlist" },
          { title: "Not accepting right now", value: "paused" },
        ],
      },
      initialValue: "accepting",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "acceptingText",
      title: "Status text — Accepting",
      description: "Shown when status is \"Accepting new patients\". One short line.",
      type: "string",
      fieldset: "availability",
      initialValue: "Attualmente accolgo nuovi pazienti.",
      validation: (Rule) =>
        Rule.required().max(90).custom(deontologyCheckWithExtraWords(AVAILABILITY_SCARCITY_WORDS)),
    }),
    defineField({
      name: "waitlistText",
      title: "Status text — Waitlist",
      description: "Shown when status is \"Waitlist / limited\". One short line.",
      type: "string",
      fieldset: "availability",
      initialValue: "Nuovi percorsi da [segnaposto — periodo]: scrivimi per riservare un posto.",
      validation: (Rule) =>
        Rule.required().max(90).custom(deontologyCheckWithExtraWords(AVAILABILITY_SCARCITY_WORDS)),
    }),
    defineField({
      name: "pausedText",
      title: "Status text — Paused",
      description: "Shown when status is \"Not accepting right now\". One short line.",
      type: "string",
      fieldset: "availability",
      initialValue: "Al momento non accolgo nuovi pazienti.",
      validation: (Rule) =>
        Rule.required().max(90).custom(deontologyCheckWithExtraWords(AVAILABILITY_SCARCITY_WORDS)),
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
        "instagram/linkedin/facebook feed JSON-LD sameAs (Stage 2 Step 4) " +
        "AND the footer's social icon row. whatsapp/youtube (footer social " +
        "icons pass) are footer-icons only — a WhatsApp link isn't a " +
        "\"profile\" in the schema.org sameAs sense, so it's deliberately " +
        "left out of structured data. Icons themselves are fixed code " +
        "assets (see components/icons/social/), not editable here — only " +
        "the URL is. Leave a field blank to hide that icon entirely; " +
        "display order in the footer is fixed (Instagram, WhatsApp, " +
        "Facebook, YouTube, LinkedIn) regardless of the order filled in " +
        "here.",
      type: "object",
      fields: [
        defineField({ name: "instagram", title: "Instagram URL", type: "url" }),
        defineField({ name: "whatsapp", title: "WhatsApp URL", type: "url" }),
        defineField({ name: "facebook", title: "Facebook URL", type: "url" }),
        defineField({ name: "youtube", title: "YouTube URL", type: "url" }),
        defineField({ name: "linkedin", title: "LinkedIn URL", type: "url" }),
      ],
    }),
    languageField(),
  ],
});
