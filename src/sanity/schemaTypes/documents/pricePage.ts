import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// /prezzi port pass — pricePage grows out of defineSimplePageType (title +
// body + seo only, simplePage.ts) into its own full defineType. That
// helper has no extension point for extra fields, and this page now needs
// several — see this pass's own report (schema-gap stop, user-approved
// field group) for why: the "C" composition (fee spread, four service
// blocks, a dark two-column band, a facts card) has no home in free-form
// portable text. body/title/seo/language below are copied verbatim from
// simplePage.ts's own shape, not reinvented — body keeps doing exactly
// what it did before (the two intro paragraphs above the fee figures);
// everything else here is additive.
//
// Fee/duration numbers are deliberately NOT fields anywhere in this file —
// every one is computed from siteSettings.pricing at render time (see
// src/sanity/pricing.ts), same as the design-lab proposal this ports.
const pricePageServiceFields = [
  defineField({
    name: "title",
    title: "Title",
    type: "string",
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: "paragraph1",
    title: "Description",
    type: "text",
    rows: 4,
    validation: (Rule) => Rule.required(),
  }),
  // derivedNote is where "same duration as X" goes for sexology/online
  // (neither has its own rate) — left empty for individual/couple, which
  // show a computed duration line instead (a code-level decision, not
  // schema-driven: these are four fixed, known services, not a repeatable
  // editor-added list). Duration-relationship text only as of this pass —
  // the fee is no longer restated here at all (the intro spread's own
  // pull-numbers and the facts card are the page's one answer to "how
  // much"); don't reintroduce a fee mention in this field.
  defineField({
    name: "derivedNote",
    title: "Derived-duration note (sexology/online only — leave empty for individual/couple; duration relationship only, no fee)",
    type: "string",
  }),
  defineField({
    name: "linkPrefix",
    title: "Link sentence — text before the linked phrase(s)",
    type: "string",
  }),
  defineField({
    name: "links",
    title: "Link sentence — linked phrase(s)",
    description:
      "Each item is one inline link inside the sentence (e.g. \"anxiety\" -> the anxiety pillar page). Rendered in order, comma-joined with \"and\"/\"e\" before the last one. Leave empty for a service with no topical link (e.g. online sessions).",
    type: "array",
    of: [
      {
        type: "object",
        name: "pricePageServiceLink",
        fields: [
          defineField({
            name: "label",
            title: "Link text",
            type: "string",
            validation: (Rule) => Rule.required(),
          }),
          defineField({
            name: "target",
            title: "Target page",
            type: "reference",
            to: [{ type: "pillarPage" }],
            validation: (Rule) => Rule.required(),
          }),
        ],
        preview: {
          select: { title: "label" },
        },
      },
    ],
  }),
  defineField({
    name: "linkSuffix",
    title: "Link sentence — text after the linked phrase(s)",
    type: "string",
  }),
];

export const pricePage = defineType({
  name: "pricePage",
  title: "Pricing page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      description: "The two intro paragraphs above the fee figures. Unchanged in shape from before this pass.",
      type: "portableText",
    }),
    defineField({
      name: "servicesHeading",
      title: "Services section — heading",
      description: "The h2 above the four service cards.",
      type: "string",
    }),
    defineField({
      name: "servicesIntro",
      title: "Services section — lead-in line",
      description: "The one place the four locations appear as a sentence outside the facts card. Rendered after the heading above.",
      type: "string",
    }),
    defineField({
      name: "services",
      title: "Services",
      description: "Four fixed services — same content shape, same order, on every locale.",
      type: "object",
      fields: [
        defineField({ name: "individual", title: "Individual session", type: "object", fields: pricePageServiceFields }),
        defineField({ name: "couple", title: "Couple session", type: "object", fields: pricePageServiceFields }),
        defineField({ name: "sexology", title: "Sexology consultation", type: "object", fields: pricePageServiceFields }),
        defineField({ name: "online", title: "Online sessions", type: "object", fields: pricePageServiceFields }),
      ],
    }),
    defineField({
      name: "darkBand",
      title: "Dark band",
      description:
        "The page's one dark section, built the same way as the homepage's Welcome/Benvenuto block: a flat dark ground (tone.tone-base-surface) with a lighter raised surface (--color-sand-deep) carrying the text — not the gradient-ground/dark-panel treatment this used before this pass.",
      type: "object",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "string" }),
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({
          name: "emphasisWord",
          title:
            "Emphasized phrase (must match text from one of the four block bodies below exactly, case-sensitive; renders in the site's animated gold treatment — leave empty for no emphasis)",
          type: "string",
        }),
        defineField({
          name: "column1",
          title: "Left column — two blocks",
          type: "object",
          fields: [
            defineField({ name: "block1Heading", title: "Block 1 — heading (h3)", type: "string" }),
            defineField({ name: "block1Body", title: "Block 1 — body", type: "text", rows: 4 }),
            defineField({ name: "block2Heading", title: "Block 2 — heading (h3)", type: "string" }),
            defineField({ name: "block2Body", title: "Block 2 — body", type: "text", rows: 4 }),
          ],
        }),
        defineField({
          name: "column2",
          title: "Right column — two blocks",
          type: "object",
          fields: [
            defineField({ name: "block1Heading", title: "Block 1 — heading (h3)", type: "string" }),
            defineField({ name: "block1Body", title: "Block 1 — body", type: "text", rows: 4 }),
            defineField({ name: "block2Heading", title: "Block 2 — heading (h3)", type: "string" }),
            defineField({ name: "block2Body", title: "Block 2 — body", type: "text", rows: 4 }),
          ],
        }),
      ],
    }),
    defineField({
      name: "facts",
      title: "Facts card",
      description: "The compact \"at a glance\" summary — label/value pairs, in display order.",
      type: "array",
      of: [
        {
          type: "object",
          name: "pricePageFact",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "value", title: "Value", type: "string", validation: (Rule) => Rule.required() }),
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    languageField(),
  ],
});
