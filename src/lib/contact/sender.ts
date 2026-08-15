import nodemailer from "nodemailer";
import type { ContactChannel } from "./validation";

// Merge pass — `contact` (polymorphic phone-or-email) is gone; email and
// telefono are now separate, explicit fields on the payload, matching
// validation.ts's own ContactFormValues shape.
//
// Libri download pass — `source`/`marketingConsent` are additive and
// optional, so every existing caller (the sitewide contact form) is
// unaffected: omitting both is identical to today's behavior. This is
// still the ONE email path, not a second one — a guide-download request
// just needs its own subject line and an explicit marker in the body so
// Giuseppe can tell it apart from an ordinary contact message (see
// isLibri below), plus the optional marketing-consent answer recorded
// somewhere, since the libri form's request body carries one and this is
// its only route to an inbox.
export interface ContactMessagePayload {
  nome: string;
  channel: ContactChannel;
  email: string;
  telefono: string;
  messaggio: string;
  source?: "contact" | "libri";
  marketingConsent?: boolean;
}

export interface SendResult {
  ok: boolean;
}

// Contact form pass — SENDER ABSTRACTION. Transport is intentionally
// undecided: the owner is choosing between his client's own SMTP and a
// transactional service (his current mailbox is personal Yahoo, so
// direct SMTP is likely to change before launch). This module is the
// ONLY place that decision plugs into — nodemailer's createTransport
// speaks plain SMTP, which covers virtually every option on the table
// (Yahoo SMTP, Resend SMTP relay, Brevo SMTP, etc.), so swapping
// providers later is an env-var change only, never a code change.
const SMTP_HOST = process.env.CONTACT_SMTP_HOST;
const SMTP_PORT = process.env.CONTACT_SMTP_PORT;
const SMTP_USER = process.env.CONTACT_SMTP_USER;
const SMTP_PASS = process.env.CONTACT_SMTP_PASS;
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL;

function isConfigured(): boolean {
  return Boolean(
    SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && CONTACT_TO_EMAIL && CONTACT_FROM_EMAIL,
  );
}

// This email is read by Giuseppe, not the visitor — always composed in
// Italian regardless of which locale the visitor filled the form in.
// Merge pass: confirmed this was already true before this pass touched
// anything (no locale parameter has ever reached this module or
// route.ts) — not a deliberate multilingual decision being preserved
// here, just how the file was originally written. Kept always-Italian
// per this pass's own instruction rather than adding locale-switching
// that was never asked for; see this pass's own report for the approved
// EN equivalent text, which deliberately has no code path here.
//
// "Telefono", not "Telefonata", for the telefonata channel — this label
// is for the Recapito block below, distinct from (and intentionally
// worded differently than) the visitor-facing channel-picker label in
// errorMessages.ts's own CHANNEL_LABELS, which stays "Telefonata".
const CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: "WhatsApp",
  telefonata: "Telefono",
  email: "Email",
};

// Never logs payload.messaggio (the visitor's own words) anywhere, in
// either the dev-fallback path or the error path below — only metadata
// (channel, whether a message was present, the error itself).
export async function sendContactMessage(payload: ContactMessagePayload): Promise<SendResult> {
  if (!isConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[contact] SMTP not configured — dev fallback (not actually sent):", {
        channel: payload.channel,
        hasMessage: Boolean(payload.messaggio),
      });
      return { ok: true };
    }
    console.error("[contact] SMTP not configured — cannot send in production");
    return { ok: false };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // Libri download pass — isLibri swaps out the channel-preference line
  // (the libri form never collects one; it always sends "email" just to
  // satisfy the shared validator) for an explicit request-type line, and
  // the free-text messaggio line for the marketing-consent answer, which
  // is what a guide request actually carries instead. See this pass's own
  // report for why this is a body-content branch on the ONE existing
  // sender rather than a second function/route.
  const isLibri = payload.source === "libri";

  // Telefono line only appears when a number was actually given — when
  // channel is "email" and telefono was left blank, the channel line above
  // already says the person chose email; a line saying no phone number was
  // given adds nothing for the reader.
  const bodyLines = [
    isLibri ? "Tipo di richiesta: download manuale gratuito" : null,
    `Nome: ${payload.nome}`,
    isLibri ? null : `Preferisce essere ricontattato via: ${CHANNEL_LABELS[payload.channel]}`,
    `Email: ${payload.email}`,
  ].filter((line): line is string => line !== null);
  if (payload.telefono) {
    bodyLines.push(`Telefono: ${payload.telefono}`);
  }
  if (isLibri) {
    bodyLines.push(`Consenso marketing: ${payload.marketingConsent ? "Sì" : "No"}`);
  } else {
    bodyLines.push(
      payload.messaggio ? `Messaggio:\n${payload.messaggio}` : "Nessun messaggio aggiuntivo.",
    );
  }

  try {
    await transporter.sendMail({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      // Merge pass fix: email is now always collected regardless of
      // channel, so replyTo can always be populated. Previously a
      // whatsapp/telefonata submission left replyTo undefined — hitting
      // "Reply" in the inbox went nowhere useful.
      replyTo: payload.email,
      subject: isLibri
        ? `Richiesta manuale gratuito dal sito — ${payload.nome}`
        : `Nuovo contatto dal sito — ${payload.nome}`,
      text: bodyLines.join("\n\n"),
    });
    return { ok: true };
  } catch (error) {
    console.error("[contact] Failed to send message:", error instanceof Error ? error.message : error);
    return { ok: false };
  }
}
