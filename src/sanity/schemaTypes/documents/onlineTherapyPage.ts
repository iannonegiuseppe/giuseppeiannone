import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// City/online pages pass — see milanPage.ts's own comment for why this is
// a bespoke type. No split/address section at all on this page (the
// brief: "no geographic split, no addresses — the axis is time zone and
// language"), and its asymmetric section needs a third main-column
// paragraph (Europe / Americas / Asia-Oceania), unlike Milan/Monza's two
// — see AsymmetricOffsetBlock.tsx's own p3 comment.
function reqString(name: string, title: string) {
  return defineField({ name, title, type: "string", validation: (Rule) => Rule.required() });
}

function reqProse(name: string, title: string, rows = 3) {
  return defineField({
    name,
    title,
    type: "text",
    rows,
    validation: (Rule) => Rule.required().custom(deontologyCheck),
  });
}

const threeBandFields = [
  reqString("heading", "Heading (h2)"),
  reqProse("p1", "Paragraph 1"),
  reqProse("p2", "Paragraph 2"),
];

const practicalColumnFields = [reqString("heading", "Heading (h3)"), reqProse("p", "Body")];

export const onlineTherapyPage = defineType({
  name: "onlineTherapyPage",
  title: "Online therapy (Italians abroad) page",
  type: "document",
  fields: [
    // --- Section 1: hero ----------------------------------------------------
    reqString("kicker", "1. Hero — kicker"),
    reqString("title", "1. Hero — title (h1)"),
    defineField({
      name: "titleEmphasisWord",
      title: "1. Hero — title, emphasized phrase (must match text from the title above exactly, case-sensitive)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    reqProse("lead", "1. Hero — lead paragraph", 2),

    // --- Section 2: why in your own language (dark, epigraph + column) -----
    defineField({
      name: "languageEpigraph",
      title: "2. Why in your own language",
      type: "object",
      fields: [
        reqString("kicker", "Kicker"),
        reqProse("epigraph", "Epigraph (large italic)", 2),
        reqProse("p1", "Paragraph 1"),
        reqProse("p2", "Paragraph 2"),
        reqProse("p3", "Paragraph 3"),
      ],
    }),

    // --- Section 3: what people arrive with (stacked bands, with links) ----
    defineField({
      name: "fourAreas",
      title: "3. What people arrive with",
      type: "object",
      fields: [
        reqString("kicker", "Kicker"),
        reqString("heading", "Heading (h2)"),
        defineField({
          name: "bands",
          title: "The four bands, in display order",
          type: "array",
          validation: (Rule) => Rule.length(4),
          of: [
            {
              type: "object",
              name: "areaBand",
              fields: [
                reqString("heading", "Heading (h2)"),
                reqProse("p1", "Paragraph 1"),
                reqProse("p2", "Paragraph 2"),
                defineField({
                  name: "links",
                  title: "Links to pillar pages (one band has two)",
                  type: "array",
                  of: [{ type: "pillarLink" }],
                  validation: (Rule) => Rule.min(1),
                }),
              ],
              preview: { select: { title: "heading" } },
            },
          ],
        }),
      ],
    }),

    // --- Section 4: time zones (asymmetric offset, 3 main paragraphs) ------
    defineField({
      name: "timeZones",
      title: "4. Time zones",
      type: "object",
      fields: [
        reqString("kicker", "Kicker"),
        reqString("heading", "Large heading"),
        defineField({
          name: "headingEmphasisWord",
          title: "Large heading — emphasized phrase (must match text from the heading above exactly, case-sensitive)",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        reqProse("p1", "Paragraph 1 — Europe"),
        reqProse("p2", "Paragraph 2 — the Americas"),
        reqProse("p3", "Paragraph 3 — Asia and Oceania"),
        defineField({
          name: "offset",
          title: "Offset block — \"Before committing to anything\"",
          type: "object",
          fields: [reqString("heading", "Heading (h3)"), reqProse("p1", "Paragraph 1"), reqProse("p2", "Paragraph 2")],
        }),
      ],
    }),

    // --- Section 5: how it works in practice (3 stacked bands, no links) ---
    defineField({
      name: "howItWorks",
      title: "5. How it works in practice",
      type: "object",
      fields: [
        defineField({ name: "band1", title: "Band 1 — the platform", type: "object", fields: threeBandFields }),
        defineField({ name: "band2", title: "Band 2 — length, fee, payment", type: "object", fields: threeBandFields }),
        defineField({ name: "band3", title: "Band 3 — if you come back, or move again", type: "object", fields: threeBandFields }),
      ],
    }),

    // --- Section 6: practical and closing (light) ---------------------------
    defineField({
      name: "practical",
      title: "6. Practical and closing",
      type: "object",
      fields: [
        defineField({ name: "col1", title: "Column 1 — where I am registered", type: "object", fields: practicalColumnFields }),
        defineField({ name: "col2", title: "Column 2 — the first session", type: "object", fields: practicalColumnFields }),
        defineField({ name: "col3", title: "Column 3 — getting in touch", type: "object", fields: practicalColumnFields }),
        reqProse("closingQuote", "Closing quote (large italic serif)", 2),
      ],
    }),

    defineField({ name: "seo", title: "SEO", type: "seo" }),
    languageField(),
  ],
  preview: {
    select: { title: "title" },
  },
});
