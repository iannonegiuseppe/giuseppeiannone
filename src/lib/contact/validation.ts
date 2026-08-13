// Contact form pass: shared, isomorphic validation — imported by the
// (single, post-merge) contact form component (client, on blur/submit) and
// api/contact/route.ts (server, re-validates everything unconditionally,
// per "never trust the client"). One source of truth for what counts as
// valid, so the two layers can't silently drift apart.
//
// Merge pass — `contact` (a polymorphic phone-or-email field keyed by
// channel) is gone. `email` and `telefono` are now separate, explicit
// fields: email is always required regardless of channel; telefono is
// required exactly when channel is "whatsapp" or "telefonata", and
// optional-but-still-shape-checked-if-present when channel is "email".
//
// Validators return error CODES ("required" | "invalid"), not prose —
// the client owns the only bilingual copy (src/lib/contact/errorMessages.ts),
// the server never needs to know what language the visitor reads in. This
// replaces the old validateContact/validateContactForm dispatcher, whose
// core logic ("contact is phone unless channel is email") assumed the
// field this pass removes and can't be adapted to it.

export type ContactChannel = "whatsapp" | "telefonata" | "email";

export interface ContactFormValues {
  nome: string;
  channel: ContactChannel | null;
  email: string;
  telefono: string;
  messaggio: string;
  consent: boolean;
}

export type ContactFieldErrorCode = "required" | "invalid";

export interface ContactFormErrors {
  nome?: ContactFieldErrorCode;
  channel?: ContactFieldErrorCode;
  email?: ContactFieldErrorCode;
  telefono?: ContactFieldErrorCode;
  consent?: ContactFieldErrorCode;
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

export function validateNome(value: string): ContactFieldErrorCode | undefined {
  if (!value.trim()) return "required";
  return undefined;
}

export function validateEmail(value: string): ContactFieldErrorCode | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "required";
  if (!EMAIL_RE.test(trimmed)) return "invalid";
  return undefined;
}

// channel decides whether an empty telefono is an error at all; a non-empty
// value is always shape-checked regardless of channel, so a malformed
// number is caught even on the "optional" (email-channel) path.
export function validateTelefono(
  channel: ContactChannel | null,
  value: string,
): ContactFieldErrorCode | undefined {
  const trimmed = value.trim();
  const required = channel === "whatsapp" || channel === "telefonata";

  if (!trimmed) {
    return required ? "required" : undefined;
  }

  const normalized = trimmed.replace(PHONE_NORMALIZE_RE, "");
  if (!PHONE_RE.test(normalized)) return "invalid";
  return undefined;
}

export function validateChannel(value: ContactChannel | null): ContactFieldErrorCode | undefined {
  if (!value) return "required";
  return undefined;
}

export function validateConsent(value: boolean): ContactFieldErrorCode | undefined {
  if (!value) return "required";
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

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const telefonoError = validateTelefono(values.channel, values.telefono);
  if (telefonoError) errors.telefono = telefonoError;

  const consentError = validateConsent(values.consent);
  if (consentError) errors.consent = consentError;

  return errors;
}
