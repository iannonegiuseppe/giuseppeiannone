import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// City/online pages pass — see milanPage.ts's own comment for why this is
// a bespoke type rather than a shared/reorderable one. This page's own
// composition is deliberately different from Milan's: the split comes
// right after the hero (not mid-page), the areas are four stacked bands
// with links (not six columns), there's a confidentiality band Milan
// doesn't have, and the closing practical trio has NO quote.
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

const practicalColumnFields = [reqString("heading", "Heading (h3)"), reqProse("p", "Body")];

export const monzaPage = defineType({
  name: "monzaPage",
  title: "Monza page",
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

    // --- Section 2: Monza or Milano (split, right after the hero) ----------
    defineField({
      name: "split",
      title: "2. Monza or Milano",
      type: "object",
      fields: [
        defineField({
          name: "left",
          title: "Left half — why Monza",
          type: "object",
          fields: [reqString("label", "Eyebrow label"), reqString("heading", "Heading (h2)"), reqProse("p1", "Paragraph 1"), reqProse("p2", "Paragraph 2")],
        }),
        defineField({
          name: "right",
          title: "Right half — why Milan",
          type: "object",
          fields: [reqString("label", "Eyebrow label"), reqString("heading", "Heading (h2)"), reqProse("p1", "Paragraph 1"), reqProse("p2", "Paragraph 2")],
        }),
      ],
    }),

    // --- Section 3: confidentiality (dark, epigraph + single column) -------
    defineField({
      name: "confidentiality",
      title: "3. Confidentiality — this page's own section, not shared with Milan",
      type: "object",
      fields: [
        reqString("kicker", "Kicker"),
        reqProse("epigraph", "Epigraph (large italic)", 2),
        reqProse("p1", "Paragraph 1"),
        reqProse("p2", "Paragraph 2"),
        reqProse("p3", "Paragraph 3"),
      ],
    }),

    // --- Section 4: four areas (stacked bands, with pillar links) ----------
    defineField({
      name: "fourAreas",
      title: "4. Four areas",
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

    // --- Section 5: working where you live (asymmetric offset) -------------
    defineField({
      name: "asymmetric",
      title: "5. Working where you live",
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
        reqProse("p1", "Paragraph 1"),
        reqProse("p2", "Paragraph 2"),
        defineField({
          name: "offset",
          title: "Offset block — \"If a period gets complicated\"",
          type: "object",
          fields: [reqString("heading", "Heading (h3)"), reqProse("p1", "Paragraph 1"), reqProse("p2", "Paragraph 2")],
        }),
      ],
    }),

    // --- Section 6: practical — NO closing quote on this page --------------
    defineField({
      name: "practical",
      title: "6. Practical (no closing quote on this page)",
      type: "object",
      fields: [
        defineField({ name: "col1", title: "Column 1 — fees and payment", type: "object", fields: practicalColumnFields }),
        defineField({ name: "col2", title: "Column 2 — before you come", type: "object", fields: practicalColumnFields }),
        defineField({ name: "col3", title: "Column 3 — how to book", type: "object", fields: practicalColumnFields }),
      ],
    }),

    defineField({ name: "seo", title: "SEO", type: "seo" }),
    languageField(),
  ],
  preview: {
    select: { title: "title" },
  },
});
