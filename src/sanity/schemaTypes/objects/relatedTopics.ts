import { defineField, defineType } from "sanity";

export const relatedTopics = defineType({
  name: "relatedTopics",
  title: "Related topics",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Topics",
      type: "array",
      of: [
        {
          type: "reference",
          to: [
            { type: "pillarPage" },
            { type: "subtopicPage" },
            { type: "article" },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare({ items }: { items?: unknown[] }) {
      return {
        title: "Related topics",
        subtitle: `${items?.length ?? 0} item(s)`,
      };
    },
  },
});
