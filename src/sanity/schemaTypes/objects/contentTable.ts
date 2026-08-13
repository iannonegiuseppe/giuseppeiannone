import { defineArrayMember, defineField, defineType } from "sanity";

// Privacy/cookie policy pass — the deliberate revisit portableText.ts's own
// comment asks for before adding a block. Added specifically because the
// legal pages' source content (a professional-drafted markdown file) has
// genuine tabular data — a legal-basis table and three cookie tables, each
// 3-4 columns — that reads worse as a definition list (confirmed against
// the actual content before adding this, not assumed). Deliberately minimal
// per that same instruction: a header row plus body rows, plain-string
// cells only. No cell merging, no per-cell alignment, no rich text inside
// a cell — those are real feature requests, not table-block basics, and
// none of the source content needs them.
export const contentTable = defineType({
  name: "contentTable",
  title: "Table",
  type: "object",
  fields: [
    defineField({
      name: "headerRow",
      title: "Header row",
      description: "Column headings, left to right.",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [
        defineArrayMember({
          name: "tableRow",
          title: "Row",
          type: "object",
          fields: [
            defineField({
              name: "cells",
              title: "Cells",
              description: "One value per column, same order as the header row.",
              type: "array",
              of: [{ type: "string" }],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: { cells: "cells" },
            prepare({ cells }: { cells?: string[] }) {
              return { title: cells?.join(" · ") ?? "(empty row)" };
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { headerRow: "headerRow", rows: "rows" },
    prepare({ headerRow, rows }: { headerRow?: string[]; rows?: unknown[] }) {
      return {
        title: "Table",
        subtitle: `${headerRow?.length ?? 0} column(s) · ${rows?.length ?? 0} row(s)`,
      };
    },
  },
});
