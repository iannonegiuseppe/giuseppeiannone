import { defineField, defineType } from "sanity";

export const faqBlock = defineType({
  name: "faqBlock",
  title: "FAQ block",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [{ type: "reference", to: [{ type: "faqItem" }] }],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare({ items }: { items?: unknown[] }) {
      return {
        title: "FAQ block",
        subtitle: `${items?.length ?? 0} question(s)`,
      };
    },
  },
});
