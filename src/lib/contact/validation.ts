// Contact form pass: shared, isomorphic validation — imported by both
// ContactForm.tsx (client, on blur/submit) and api/contact/route.ts
// (server, re-validates everything unconditionally, per "never trust the
// client"). One source of truth for what counts as valid, so the two
// layers can't silently drift apart.

export type ContactChannel = "whatsapp" | "telefonata" | "email";

export interface ContactFormValues {
  nome: string;
  channel: ContactChannel | null;
  contact: string;
  messaggio: string;
  consent: boolean;
}

export interface ContactFormErrors {
  nome?: string;
  channel?: string;
  contact?: string;
  consent?: string;
}

// Pragmatic, not RFC-pedantic — per spec.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// No heavy phone library (libphonenumber is ~100KB for one field and its
// strict validation rejects real numbers) — normalize punctuation, then
// accept an optional leading "+" and 8–15 digits. Rejects letters
// (normalize only strips spaces/dashes/dots/parens, never digits-vs-
// letters) and obviously-short input.
const PHONE_NORMALIZE_RE = /[\s\-.()]/g;
const PHONE_RE = /^\+?\d{8,15}$/;

export function validateNome(value: string): string | undefined {
  if (!value.trim()) return "Il nome è obbligatorio.";
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed || !EMAIL_RE.test(trimmed)) {
    return "L'indirizzo email non sembra completo.";
  }
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  const normalized = value.replace(PHONE_NORMALIZE_RE, "");
  if (!normalized || !PHONE_RE.test(normalized)) {
    return "Controlla il numero: sembra troppo corto.";
  }
  return undefined;
}

export function validateChannel(value: ContactChannel | null): string | undefined {
  if (!value) return "Scegli come preferisci essere ricontattato.";
  return undefined;
}

export function validateContact(
  channel: ContactChannel | null,
  value: string,
): string | undefined {
  if (!channel) return undefined; // channel's own error covers this case
  return channel === "email" ? validateEmail(value) : validatePhone(value);
}

export function validateConsent(value: boolean): string | undefined {
  if (!value) return "Per inviare serve il consenso privacy.";
  return undefined;
}

// messaggio is optional — no validator needed, included in ContactFormValues
// only so the payload shape is complete.

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  const nomeError = validateNome(values.nome);
  if (nomeError) errors.nome = nomeError;

  const channelError = validateChannel(values.channel);
  if (channelError) errors.channel = channelError;

  const contactError = validateContact(values.channel, values.contact);
  if (contactError) errors.contact = contactError;

  const consentError = validateConsent(values.consent);
  if (consentError) errors.consent = consentError;

  return errors;
}
