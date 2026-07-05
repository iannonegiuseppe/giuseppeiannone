import { defineField, defineType } from "sanity";

export const conditionCard = defineType({
  name: "conditionCard",
  title: "Condition card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "link",
      title: "Related page",
      type: "reference",
      to: [{ type: "pillarPage" }, { type: "subtopicPage" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});
