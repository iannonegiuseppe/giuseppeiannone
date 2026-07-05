import { defineField, defineType } from "sanity";
import { SlugLockedAfterPublish } from "../../components/SlugLockedAfterPublish";
import { languageField } from "../lib/languageField";

export const subtopicPage = defineType({
  name: "subtopicPage",
  title: "Subtopic page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "parentPillar",
      title: "Parent pillar",
      description:
        "Must be the pillar page in the same language as this subtopic (each language is a separate document).",
      type: "reference",
      to: [{ type: "pillarPage" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description:
        "Own URL segment only (e.g. attacchi-di-panico) — the public URL is the parent pillar's slug plus this segment, composed at render time.",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
      components: { input: SlugLockedAfterPublish },
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
