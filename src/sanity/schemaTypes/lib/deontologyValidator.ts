import { plainTextFromPortableText } from "../../jsonLd";

// Word list from docs/design-direction.md §9 ("Hard exclusions — deontology
// + strategy — non-negotiable") plus the urgency-word set the promotion
// pass's own QA grep already checked for (.review/promotion/stage6-qa.mjs).
// Case-insensitive substring match — deliberately blunt (catches
// "gratuitamente" via "gratuito" too) since a false positive just makes an
// editor rephrase, while a false negative ships a deontology violation.
const FORBIDDEN_WORDS = [
  "gratuito",
  "%",
  "superare",
  "guarire",
  "risolvere",
  "garantito",
  "recensioni",
  "testimonianze",
  "sconto",
  "solo oggi",
  "offerta limitata",
];

// Shared Rule.custom validator — attach as
// `validation: (Rule) => Rule.required().custom(deontologyCheck)` on any
// free-text field (plain string/text) or Portable Text array that renders
// as visitor-facing copy. Returns `true` (valid) or an error string citing
// the source section so an editor understands WHY Studio is blocking the
// word, not just that it is.
export function deontologyCheck(value: unknown): true | string {
  const text = typeof value === "string" ? value : plainTextFromPortableText(value);
  if (!text) return true;

  const lowerText = text.toLowerCase();
  const match = FORBIDDEN_WORDS.find((word) => lowerText.includes(word));
  if (!match) return true;

  return (
    `Contains "${match}", which docs/design-direction.md §9 (Hard exclusions ` +
    "— deontology + strategy) forbids: no percentage/counter/outcome claims, " +
    "no discount or urgency framing, no \"free session\" wording, no " +
    "testimonials/reviews language. Rephrase to describe the practice " +
    "factually instead."
  );
}
