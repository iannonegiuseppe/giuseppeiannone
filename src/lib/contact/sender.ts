import nodemailer from "nodemailer";
import type { ContactChannel } from "./validation";

export interface ContactMessagePayload {
  nome: string;
  channel: ContactChannel;
  contact: string;
  messaggio: string;
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

const CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: "WhatsApp",
  telefonata: "Telefonata",
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

  try {
    await transporter.sendMail({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      replyTo: payload.channel === "email" ? payload.contact : undefined,
      subject: `Nuovo contatto dal sito — ${payload.nome}`,
      text: [
        `Nome: ${payload.nome}`,
        `Preferisce essere ricontattato via: ${CHANNEL_LABELS[payload.channel]}`,
        `Recapito: ${payload.contact}`,
        payload.messaggio ? `Messaggio:\n${payload.messaggio}` : "Nessun messaggio aggiuntivo.",
      ].join("\n\n"),
    });
    return { ok: true };
  } catch (error) {
    console.error("[contact] Failed to send message:", error instanceof Error ? error.message : error);
    return { ok: false };
  }
}
