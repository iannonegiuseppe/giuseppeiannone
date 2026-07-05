import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Shared shape for singleton pages that are just a title + body + SEO.
export function defineSimplePageType(options: { name: string; title: string }) {
  return defineType({
    name: options.name,
    title: options.title,
    type: "document",
    fields: [
      defineField({
        name: "title",
        title: "Title",
        type: "string",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "body",
        title: "Body",
        type: "portableText",
      }),
      defineField({
        name: "seo",
        title: "SEO",
        type: "seo",
      }),
      languageField(),
    ],
  });
}
