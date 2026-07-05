import { defineField, defineType } from "sanity";

export const ctaBlock = defineType({
  name: "ctaBlock",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "buttonLabel",
      title: "Button label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "buttonHref",
      title: "Button link",
      description: "Internal path (e.g. /contatti) or a full URL",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "heading" },
  },
});
