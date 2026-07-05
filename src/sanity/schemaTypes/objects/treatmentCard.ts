import { defineField, defineType } from "sanity";

export const treatmentCard = defineType({
  name: "treatmentCard",
  title: "Treatment card",
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
      to: [
        { type: "pillarPage" },
        { type: "subtopicPage" },
        { type: "service" },
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});
