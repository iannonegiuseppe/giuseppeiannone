import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// City/online pages pass — bespoke document type, same call methodPage.ts
// already made (see that file's own comment): named fields in a fixed
// order, not a generic reorderable block array. The section order below
// (hero, six areas, split, asymmetric, two bands, practical+quote) IS the
// design for this specific page — an editor changing copy can't also
// reorder it, which matches the brief directly ("the order is a design
// decision per page, not content"). If a future page needs a genuinely
// different composition, it gets its own bespoke type the same way this
// one did, not a flag on this one — same reasoning src/sanity/paths.ts's
// own singleton-route comment gives for one-folder-per-page over a
// dispatcher.
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

const bandFields = [
  reqString("heading", "Heading (h2)"),
  reqProse("p1", "Paragraph 1"),
  reqProse("p2", "Paragraph 2"),
];

const practicalColumnFields = [reqString("heading", "Heading (h3)"), reqProse("p", "Body")];

export const milanPage = defineType({
  name: "milanPage",
  title: "Milan page",
  type: "document",
  fields: [
    // --- Section 1: hero (light island, centred) ---------------------------
    reqString("kicker", "1. Hero — kicker"),
    reqString("title", "1. Hero — title (h1)"),
    defineField({
      name: "titleEmphasisWord",
      title: "1. Hero — title, emphasized phrase (must match text from the title above exactly, case-sensitive)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    reqProse("lead", "1. Hero — lead paragraph", 2),

    // --- Section 2: the six areas (light, page-local 3-column grid) --------
    defineField({
      name: "sixAreas",
      title: "2. The six areas",
      description:
        "Not a StackedBands instance — this page's own 3-column grid (2 rows of 3). Three or four sentences per item plus a link, per the brief: the pillar page explains what the topic is, this page says how it presents in Milan and where to go.",
      type: "object",
      fields: [
        reqString("kicker", "Kicker"),
        reqString("heading", "Heading (h2)"),
        reqProse("intro", "Intro paragraph", 3),
        defineField({
          name: "items",
          title: "The six columns, in display order",
          type: "array",
          validation: (Rule) => Rule.length(6),
          of: [
            {
              type: "object",
              name: "areaColumn",
              fields: [
                reqString("title", "Column heading (h3)"),
                reqProse("body", "Column paragraph"),
                defineField({ name: "link", title: "Link to the pillar page", type: "pillarLink" }),
              ],
              preview: { select: { title: "title" } },
            },
          ],
        }),
      ],
    }),

    // --- Section 3: the split (two studios, dark left / surface right) -----
    defineField({
      name: "split",
      title: "3. The two studios",
      type: "object",
      fields: [
        defineField({
          name: "left",
          title: "Left half",
          type: "object",
          fields: [reqString("label", "Eyebrow label"), reqString("heading", "Heading (h2)"), reqProse("p1", "Paragraph 1"), reqProse("p2", "Paragraph 2")],
        }),
        defineField({
          name: "right",
          title: "Right half",
          type: "object",
          fields: [reqString("label", "Eyebrow label"), reqString("heading", "Heading (h2)"), reqProse("p1", "Paragraph 1"), reqProse("p2", "Paragraph 2")],
        }),
      ],
    }),

    // --- Section 4: how to choose (light, asymmetric offset) ---------------
    defineField({
      name: "asymmetric",
      title: "4. How to choose",
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
          title: "Offset block — \"If neither is convenient\"",
          type: "object",
          fields: [reqString("heading", "Heading (h3)"), reqProse("p1", "Paragraph 1"), reqProse("p2", "Paragraph 2")],
        }),
      ],
    }),

    // --- Section 5: online + first meeting (dark/surface, two bands) -------
    defineField({
      name: "twoBands",
      title: "5. Online and the first meeting",
      type: "object",
      fields: [
        defineField({ name: "band1", title: "Band 1 — if coming to the practice is complicated", type: "object", fields: bandFields }),
        defineField({ name: "band2", title: "Band 2 — the first meeting", type: "object", fields: bandFields }),
      ],
    }),

    // --- Section 6: practical and closing (light) ---------------------------
    defineField({
      name: "practical",
      title: "6. Practical and closing",
      type: "object",
      fields: [
        defineField({ name: "col1", title: "Column 1 — fees", type: "object", fields: practicalColumnFields }),
        defineField({ name: "col2", title: "Column 2 — languages", type: "object", fields: practicalColumnFields }),
        defineField({ name: "col3", title: "Column 3 — booking", type: "object", fields: practicalColumnFields }),
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
