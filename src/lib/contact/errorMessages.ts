// Client-only copy layer for validation.ts's error codes. The server
// (api/contact/route.ts) never imports this — it returns codes only, so it
// never needs to know what language the visitor reads in. This is the ONE
// place bilingual error prose lives; ContactForm.tsx used to keep its own
// separate copy object duplicating this same information, which is exactly
// what this merge removes.
//
// Some (field, code) pairs are currently unreachable — nome/channel/consent
// only ever produce "required" (their validators never return "invalid") —
// kept fully populated anyway for type completeness and so a future
// validator change can't silently look up a missing message.

import type { ContactFieldErrorCode } from "./validation";

export type ContactFieldName = "nome" | "email" | "telefono" | "channel" | "consent";
export type ContactLocale = "it" | "en";

type MessageTable = Record<ContactFieldName, Record<ContactFieldErrorCode, string>>;

// telefono's "required" strings are new copy for this pass (telefono was
// never a required field before) — approved directly, not carried over.
// Every other string below is carried over verbatim from ContactForm.tsx's
// prior COPY.errors object.
const MESSAGES: Record<ContactLocale, MessageTable> = {
  it: {
    nome: {
      required: "Il nome è obbligatorio.",
      invalid: "Il nome è obbligatorio.",
    },
    email: {
      required: "L'indirizzo email non sembra completo.",
      invalid: "L'indirizzo email non sembra completo.",
    },
    telefono: {
      required: "Il numero di telefono è obbligatorio se preferisci WhatsApp o una telefonata.",
      invalid: "Controlla il numero: sembra troppo corto.",
    },
    channel: {
      required: "Scegli come preferisci essere ricontattato.",
      invalid: "Scegli come preferisci essere ricontattato.",
    },
    consent: {
      required: "Per inviare serve il consenso privacy.",
      invalid: "Per inviare serve il consenso privacy.",
    },
  },
  en: {
    nome: {
      required: "Name is required.",
      invalid: "Name is required.",
    },
    email: {
      required: "That email address doesn't look complete.",
      invalid: "That email address doesn't look complete.",
    },
    telefono: {
      required: "A phone number is required if you would prefer WhatsApp or a call.",
      invalid: "Check the number: it looks too short.",
    },
    channel: {
      required: "Choose how you'd prefer to be contacted.",
      invalid: "Choose how you'd prefer to be contacted.",
    },
    consent: {
      required: "Consent is required to send this.",
      invalid: "Consent is required to send this.",
    },
  },
};

export function contactErrorMessage(
  locale: ContactLocale,
  field: ContactFieldName,
  code: ContactFieldErrorCode,
): string {
  return MESSAGES[locale][field][code];
}
