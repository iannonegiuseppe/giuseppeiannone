import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

export const faqPage = defineType({
  name: "faqPage",
  title: "FAQ page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "titleEmphasisWord",
      title: "Title — emphasized phrase (must match text from the title above exactly, case-sensitive; renders in the site's animated accent treatment — leave empty for no emphasis)",
      type: "string",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "portableText",
    }),
    // /faq hero illustration pass — independent from homePage.hero.photo
    // (the shared portrait /blog still uses via getHeroPortrait()). This
    // page gets its own image so the two can diverge; deliberately NOT
    // reusing the shared field.
    defineField({
      name: "photo",
      title: "Hero illustration",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
    }),
    // DEPRECATED-IN-PLACE, not migrated: "faqs" is a single flat faqBlock
    // (array of faqItem references) and can't express topic grouping.
    // "sections" (below) supersedes it for any page that needs grouped
    // FAQ display. Left here untouched, not deleted or backfilled — no
    // code currently reads faqPage.faqs (checked: zero faqPage documents
    // exist yet, so nothing has ever fetched this field in production;
    // structure.ts's own comment lists it as a conceptual consumer of
    // faqItem, not something that reads faqPage itself). Same
    // orphan-not-delete precedent as diploma/qualification elsewhere in
    // this schema set.
    defineField({
      name: "faqs",
      title: "Questions (flat, deprecated — see \"Sections\" below)",
      type: "faqBlock",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      description:
        "Grouped FAQ sections, in display order. Each section has its own title, " +
        "description, and a list of questions (referencing the same faqItem " +
        "documents used elsewhere on the site).",
      type: "array",
      of: [
        {
          type: "object",
          name: "faqSection",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required().custom(deontologyCheck),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "string",
              validation: (Rule) => Rule.required().custom(deontologyCheck),
            }),
            defineField({
              name: "items",
              title: "Questions",
              type: "array",
              of: [{ type: "reference", to: [{ type: "faqItem" }] }],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description", items: "items" },
            prepare({ title, subtitle, items }: { title?: string; subtitle?: string; items?: unknown[] }) {
              return {
                title: title ?? "Untitled section",
                subtitle: `${subtitle ?? ""} — ${items?.length ?? 0} question(s)`,
              };
            },
          },
        },
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
