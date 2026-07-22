import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

// Aree section pass: one row in the homepage's typographic intervention-
// area list (AreeSection.tsx). Plain list type (not an array field on a
// singleton) — deliberately, per this pass's own instruction — since each
// row's optional `slug` is a forward-looking reference to its own future
// individual area page (matching pillarPage/subtopicPage's own slug-
// based routing), which a plain array item doesn't carry the same
// "this is its own future document" identity for.
//
// Supersedes ConcernsSection.tsx/homePage.diCosa (the older "Di cosa mi
// occupo" pairing) — that component/field group is left registered,
// still gated, and untouched (orphaned, not deleted), same precedent as
// diploma/qualification and homePage.chiSono/ChiSonoOverlap before it.
export const area = defineType({
  name: "area",
  title: "Area",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    defineField({
      name: "descriptor",
      title: "Descriptor",
      description:
        "One line, present tense, describes the condition — never an outcome " +
        "(no \"superare\"/\"eliminare\"/\"guarire\" — see docs/design-direction.md §9).",
      type: "string",
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Optional — for a future individual area page (none exist yet, leave empty).",
      type: "slug",
    }),
    defineField({
      name: "order",
      title: "Display order",
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
    select: { title: "title", subtitle: "descriptor" },
  },
});
