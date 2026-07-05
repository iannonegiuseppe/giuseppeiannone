import { defineField, defineType } from "sanity";

export const keyTakeaways = defineType({
  name: "keyTakeaways",
  title: "Key takeaways",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.required().min(3).max(6),
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare({ items }: { items?: string[] }) {
      return {
        title: "Key takeaways",
        subtitle: `${items?.length ?? 0} item(s)`,
      };
    },
  },
});
