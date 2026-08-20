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
// Hardening pass — locale (for the confirmation email's own language) and
// spamSignalsLine (contentSignals.ts's flag line, or undefined when
// nothing was flagged) are both new and both optional/additive, same
// precedent the libri fields already set: every existing caller that
// doesn't pass them behaves exactly as before.
export interface ContactMessagePayload {
  nome: string;
  channel: ContactChannel;
  email: string;
  telefono: string;
  messaggio: string;
  source?: "contact" | "libri";
  marketingConsent?: boolean;
  locale?: "it" | "en";
  spamSignalsLine?: string;
}

export interface SendResult {
  ok: boolean;
  // Set only when ok is false and the cause was specifically "nothing is
  // configured" — lets route.ts's caller (or a human watching logs)
  // distinguish "SMTP rejected the send" from "SMTP was never set up",
  // without exposing which vars are missing to the HTTP response itself.
  reason?: "not-configured" | "send-failed";
}

// Contact form pass — SENDER ABSTRACTION, simplified: the owner settled
// on Hostinger SMTP, so host/port/secure are no longer a per-environment
// decision — they're fixed facts about that relay, not secrets, and
// belong in code rather than three more env vars to keep in sync across
// .env.local and Vercel. Only the mailbox credentials are still
// per-environment secrets.
const SMTP_HOST = "smtp.hostinger.com";
const SMTP_PORT = 465;
const SMTP_SECURE = true;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// Both From and To are EMAIL_USER itself right now — Alex is testing
// against his own mailbox before this points at Giuseppe's. ONE constant
// used for both, not two independently-set ones that happen to match
// today: repointing "To" at Giuseppe's address later (once testing is
// done) is a single edit to CONTACT_RECIPIENT below, not a search across
// this file for every place EMAIL_USER was reused as a recipient.
const CONTACT_RECIPIENT = EMAIL_USER;

const REQUIRED_ENV: Record<string, string | undefined> = {
  EMAIL_USER,
  EMAIL_PASSWORD,
};

function missingEnvNames(): string[] {
  return Object.entries(REQUIRED_ENV)
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

function isConfigured(): boolean {
  return missingEnvNames().length === 0;
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

// Never logs payload.messaggio (the visitor's own words) anywhere,
// including the not-configured and error paths below — only metadata
// (which env vars are missing, the error itself).
export async function sendContactMessage(payload: ContactMessagePayload): Promise<SendResult> {
  // "Did the request even get here" was exactly the question that took
  // tracing code to answer last time (the honeypot's own silent-success
  // response meant the answer was "no" and nothing in the log said so).
  // One line, metadata only, answers it directly from the log next time.
  console.log(`[contact] sendContactMessage called — channel=${payload.channel} source=${payload.source ?? "contact"}`);

  if (!isConfigured()) {
    // No dev-mode stub: a stub that fakes { ok: true } without sending
    // lies about success at exactly the moment (testing SMTP setup)
    // where that lie is most costly. Fails visibly, names WHICH env vars
    // are missing (names only — never values — same discipline as the
    // rest of this function) so a developer immediately knows why,
    // whether that's a local .env.local gap or a Vercel project setting.
    console.error(
      `[contact] Cannot send — missing env var(s): ${missingEnvNames().join(", ")}. Message NOT sent.`,
    );
    return { ok: false, reason: "not-configured" };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
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
  // Hardening pass — content-signal flag, appended last so it never
  // disrupts the normal reading order of a clean message; simply absent
  // when contentSignals.ts found nothing (see that file's own comment).
  if (payload.spamSignalsLine) {
    bodyLines.push(payload.spamSignalsLine);
  }

  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: CONTACT_RECIPIENT,
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
  } catch (error) {
    console.error("[contact] Failed to send message:", error instanceof Error ? error.message : error);
    return { ok: false, reason: "send-failed" };
  }

  // Hardening pass — the visitor-facing confirmation, sent only once the
  // internal notification above has actually succeeded. Deliberately its
  // own try/catch, logged and swallowed on failure: the internal message
  // reaching Giuseppe is the whole point of this function, the
  // confirmation is a courtesy on top of it, and a courtesy failing must
  // never turn a successful submission into an error the visitor sees.
  try {
    await transporter.sendMail(buildConfirmationEmail(payload));
  } catch (error) {
    console.error(
      "[contact] Confirmation email failed to send (internal notification already delivered):",
      error instanceof Error ? error.message : error,
    );
  }

  return { ok: true };
}

// PLACEHOLDER COPY — plumbing only, per this pass's own instruction. Not
// approved text; the owner will write the real subject/body once this
// shape (locale-aware, its own send, its own failure path) is visible.
const CONFIRMATION_SUBJECT: Record<"it" | "en", string> = {
  it: "[SEGNAPOSTO] Abbiamo ricevuto il tuo messaggio",
  en: "[PLACEHOLDER] We've received your message",
};

function confirmationBody(locale: "it" | "en", nome: string): string {
  if (locale === "en") {
    return [
      `Hi ${nome},`,
      "[PLACEHOLDER] This confirms we've received your message and will get back to you soon.",
      "— Dr. Giuseppe Iannone",
    ].join("\n\n");
  }
  return [
    `Ciao ${nome},`,
    "[SEGNAPOSTO] Confermiamo di aver ricevuto il tuo messaggio. Ti risponderemo al più presto.",
    "— Dr. Giuseppe Iannone",
  ].join("\n\n");
}

function buildConfirmationEmail(payload: ContactMessagePayload) {
  const locale = payload.locale ?? "it";
  return {
    from: EMAIL_USER,
    to: payload.email,
    subject: CONFIRMATION_SUBJECT[locale],
    text: confirmationBody(locale, payload.nome),
  };
}
