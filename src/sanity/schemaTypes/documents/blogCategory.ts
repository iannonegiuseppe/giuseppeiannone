import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Blog category-chip pass (round 2) — a blog category is deliberately NOT
// a pillar. A pillar says "this is what I treat" (drives the Aree menu,
// has its own route, is in the sitemap); a blog category says "this is
// what I have written about" (a /blog filter chip, nothing else).
// Modeled as its own document type — not a second reference target on
// article.area, not a string enum (see the owner's own three-option
// request and the chosen option B) — so isolation from the Aree menu,
// every route, and the sitemap happens BY CONSTRUCTION: nothing that
// builds those ever queries `_type == "blogCategory"`, so there is no
// exclusion list for a future pass to forget to update, unlike widening
// article.area's own reference type would have required. See article.ts's
// own `blogCategory` field for the other half — an independent, optional
// reference, never mixed into area/areaOther's required-XOR validation.
//
// `order` (not alphabetical) controls each category's position among the
// other blog categories in the chip row — see areaTaxonomy.ts's own
// getBlogCategoryChipCounts comment for why alphabetical was rejected.
export const blogCategory = defineType({
  name: "blogCategory",
  title: "Blog category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description:
        "The chip label on /blog. Keep it short — this renders in a horizontally-scrolling row alongside the seven pillar names.",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      description:
        "Position among the OTHER blog categories in the /blog filter row (these always render after the seven pillars, never mixed in among them). Lower numbers render first.",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    languageField(),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", order: "order" },
    prepare({ title, order }: { title?: string; order?: number }) {
      return { title: title ?? "", subtitle: order !== undefined ? `#${order}` : undefined };
    },
  },
});
