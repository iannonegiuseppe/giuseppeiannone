import { defineField, defineType } from "sanity";
import { deontologyCheckAllowingSymbols } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";

export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ item",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "faqAnswer",
      // "%" exempted — same narrow, disclosed carve-out as homePage.tariffe's
      // detrazioneFootnote (see deontologyCheckAllowingSymbols's own
      // comment): the 19% tax-deductibility rate is a factual, §9-permitted
      // use of a percent sign, not the outcome/comparison claim the plain
      // deontologyCheck's blanket "%" ban exists to catch. Every other
      // forbidden word/phrase still applies in full.
      validation: (Rule) => Rule.required().custom(deontologyCheckAllowingSymbols(["%"])),
    }),
    languageField(),
  ],
  preview: {
    select: { title: "question" },
  },
});
