import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      // Required is a hard error; the length limit is a soft warning so a
      // one-character overage doesn't block publishing.
      validation: (Rule) => [
        Rule.required(),
        Rule.max(60).warning(
          "Meta titles over 60 characters may be truncated in search results.",
        ),
      ],
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      validation: (Rule) => [
        Rule.required(),
        Rule.max(160).warning(
          "Meta descriptions over 160 characters may be truncated in search results.",
        ),
      ],
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
