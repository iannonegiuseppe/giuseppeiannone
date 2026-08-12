import { defineArrayMember, defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";
import { pillarLinkAnnotation } from "../objects/pillarLinkAnnotation";

// Contatti build pass — contactPage grows out of defineSimplePageType
// (title + body + seo only, simplePage.ts) into its own full defineType,
// same call this codebase already made for pricePage.ts (see that file's
// own comment: the generic factory has no extension point for extra
// fields). This page's structure — three channel blocks, an hours/
// appointments strip, four location cards, an online strip — has no home
// in free-form portable text. title/seo/language below are copied
// verbatim from simplePage.ts's own shape; `body` is dropped entirely
// (unlike pricePage, this page has no free-form intro prose slot — every
// piece of copy here is one of the structured fields below).
//
// Naming follows the established faqPage/pricePage convention: `title` IS
// the rendered h1 text (not a separate admin-only label), with
// `titleEmphasisWord` as the one animated/emphasized word within it.
export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  fields: [
    defineField({
      name: "kicker",
      title: "Kicker",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title (h1)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "titleEmphasisWord",
      title:
        "Title — emphasized word (must match text from the title above exactly, case-sensitive; renders in the site's animated accent treatment — leave empty for no emphasis)",
      type: "string",
    }),
    // Lead-expansion pass: was type "text" (plain string) — couldn't hold
    // more than one visual paragraph (no paragraph-break support once
    // rendered) or any inline links at all, and the second paragraph
    // needs both. A dedicated, narrow array type — NOT the shared
    // portableText type (objects/portableText.ts), which is deliberately
    // restricted per content type (CLAUDE.md) and carries headings/
    // images/lists/custom content blocks this three-paragraph lead has no
    // use for. Only "normal" paragraphs, no decorators (bold/italic
    // weren't asked for and the copy doesn't use them), and exactly one
    // annotation: pillarLinkAnnotation, a reference-based link (see that
    // file's own comment for why not linkAnnotation's raw URL string).
    defineField({
      name: "intro",
      title: "Intro (lead)",
      description:
        "Three short paragraphs. Named difficulties in the middle paragraph link to their pillar pages via the \"Link to topic page\" annotation on the linked phrase.",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [],
            annotations: [pillarLinkAnnotation()],
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "whatsapp",
      title: "WhatsApp block",
      description: "The dominant channel block. The phone number itself is never typed here — it renders live from siteSettings.contactChannels.",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Eyebrow label", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3, validation: (Rule) => Rule.required() }),
        defineField({ name: "cta", title: "Button label", type: "string", validation: (Rule) => Rule.required() }),
      ],
    }),
    defineField({
      name: "phone",
      title: "Phone card",
      description: "The number itself is never typed here (same number as WhatsApp, shown once there) — this card links via tel: without repeating the digits.",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Eyebrow label", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3, validation: (Rule) => Rule.required() }),
      ],
    }),
    defineField({
      name: "email",
      title: "Email card",
      description: "The address itself renders live from siteSettings.contactChannels, not typed here.",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Eyebrow label", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3, validation: (Rule) => Rule.required() }),
      ],
    }),
    defineField({
      name: "hours",
      title: "Hours",
      description: "Page-level only — shown once, never per location (he cannot be at four studios at once).",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Eyebrow label", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "value", title: "Value", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "note", title: "Note", type: "string", validation: (Rule) => Rule.required() }),
      ],
    }),
    defineField({
      name: "appointments",
      title: "Appointments",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Eyebrow label", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "value", title: "Value", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "note", title: "Note", type: "string", validation: (Rule) => Rule.required() }),
      ],
    }),
    defineField({
      name: "sediKicker",
      title: "Locations section — kicker",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sediHeading",
      title: "Locations section — heading (h2)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "online",
      title: "Online strip",
      description: "The wide full-width strip below the four location cards — online has no address and would read as a broken card in that grid.",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3, validation: (Rule) => Rule.required() }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    languageField(),
  ],
});
