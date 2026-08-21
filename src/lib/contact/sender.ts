import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import type { ContactChannel } from "./validation";
import { getEmailFooterData } from "./emailFooterData";
import { getLibriGuidePdfUrl } from "./libriPdfUrl";
import {
  renderEmailHtml,
  renderEmailText,
  LOGO_CID,
  type EmailContent,
  type EmailFooterLines,
  type EmailPracticalLine,
} from "./emailTemplate";

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
// Internal-notification context pass — pageTitle/pagePath/deviceType are
// all new, all optional/additive, same precedent as every prior field on
// this payload: every existing caller that doesn't pass them behaves
// exactly as before. Deliberately NOT added: IP address, a city derived
// from it, or a search referrer — the message itself is health data on
// this site, so the surrounding context is too, and none of those three
// are needed to reply (see buildInternalContent's own comment).
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
  pageTitle?: string;
  pagePath?: string;
  deviceType?: "phone" | "desktop";
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
// that was never asked for.
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

// HTML email pass — the logo is a real file (public/email/logo.png, a
// 440x74 2x-retina export of contents/logo.png, resized once rather than
// on every send) attached as a CID inline image, never a linked
// <img src="https://...">. Most mail clients block remote images by
// default on first open — a linked logo would simply not render, no
// matter how correct the URL is; a CID attachment is embedded IN the
// message itself and always renders (or, if a client also blocks inline
// images specifically, falls back to the alt text — see
// emailTemplate.ts's own alt attribute). Read once at module load, not
// per send: this file's contents never change at runtime.
const LOGO_PATH = path.join(process.cwd(), "public", "email", "logo.png");
let logoAttachmentContent: Buffer | null = null;
try {
  logoAttachmentContent = fs.readFileSync(LOGO_PATH);
} catch {
  // Missing at build/deploy time would be a real bug, but failing to
  // attach a logo must never be why a contact message doesn't reach
  // Giuseppe — sendMail below only includes the attachment when this
  // succeeded, same "degrade, don't crash" discipline as everything else
  // in this file.
  console.error(`[contact] Logo not found at ${LOGO_PATH} — emails will send without it.`);
}

function logoAttachment() {
  if (!logoAttachmentContent) return [];
  return [
    {
      filename: "logo.png",
      content: logoAttachmentContent,
      cid: LOGO_CID,
      contentDisposition: "inline" as const,
    },
  ];
}

// Hardcoded rather than a sede/locationPage Sanity query — confirmed
// with the owner that a full fetch for one footer line is overkill. This
// constant is the one place a new/changed location needs editing; it is
// NOT derived from the `sede` documents driving the site's own location
// pages/marquee, so a location added there doesn't automatically show up
// here — someone has to remember to update this too.
const LOCATIONS_LINE: Record<"it" | "en", string> = {
  it: "Milano Citylife e Bicocca · Monza · Cernusco sul Naviglio · Online",
  en: "Milan Citylife and Bicocca · Monza · Cernusco sul Naviglio · Online",
};

function footerLines(locale: "it" | "en"): EmailFooterLines {
  return { locationsLine: LOCATIONS_LINE[locale] };
}

// Copy pass — {canale} in the confirmation body ("Ti ricontatto {canale},
// ...") reads as a natural phrase per channel, not just the bare
// CHANNEL_LABELS noun ("Ti ricontatto WhatsApp" isn't a sentence).
const CANALE_PHRASES: Record<"it" | "en", Record<ContactChannel, string>> = {
  it: { whatsapp: "su WhatsApp", telefonata: "per telefono", email: "via email" },
  en: { whatsapp: "via WhatsApp", telefonata: "by phone", email: "via email" },
};

const PAGE_LANGUAGE_LABEL: Record<"it" | "en", string> = { it: "Italiano", en: "Inglese" };
const DEVICE_LABEL: Record<"phone" | "desktop", string> = { phone: "Telefono", desktop: "Desktop" };

// Internal-notification context pass — "21 agosto 2026 alle ore 08:11",
// always Europe/Rome regardless of the server's own default (Vercel
// Node.js functions default to UTC unless TZ is set — confirmed no TZ is
// configured for this project — so this is NOT relying on that default,
// it converts explicitly). Computed fresh here, at email-build time,
// rather than threaded through as a payload field from route.ts: the gap
// between "request received" and "email composed" is sub-second, well
// under the minute-level precision this displays, so there was nothing
// real to gain from one more field on the payload.
function formatSubmittedAt(): string {
  return new Date().toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Internal notification: real, final copy for both branches now. Two
// blocks, deliberately unequal in weight, per the owner's own instinct
// (see emailTemplate.ts's own renderSecondaryBlockHtml comment for the
// visual reasoning) — the FIRST is the person (what he reads first:
// Nome, preferred channel, Email, Telefono, Messaggio), the SECOND is
// the submission's own context (Pagina, Lingua della pagina,
// Dispositivo, Orario), quieter and below, because it's about the
// enquiry, not the person. The spam-signal line, when it fires, joins
// the SECOND block for the same reason — it describes the submission,
// not the person who sent it. Deliberately excludes IP/city/referrer —
// see ContactMessagePayload's own comment for why; page title,
// submission time, and device type are not personal data the way an
// IP-derived location would be, and none of the three need a
// privacy-policy change (see this pass's own report).
function buildInternalContent(payload: ContactMessagePayload, isLibri: boolean): EmailContent {
  const personLines = [
    isLibri ? "Tipo di richiesta: download manuale gratuito" : null,
    `Nome: ${payload.nome}`,
    isLibri ? null : `Preferisce essere ricontattato via: ${CHANNEL_LABELS[payload.channel]}`,
    `Email: ${payload.email}`,
  ].filter((line): line is string => line !== null);
  if (payload.telefono) {
    personLines.push(`Telefono: ${payload.telefono}`);
  }
  if (isLibri) {
    personLines.push(`Consenso marketing: ${payload.marketingConsent ? "Sì" : "No"}`);
  } else {
    personLines.push(payload.messaggio ? `Messaggio: ${payload.messaggio}` : "Nessun messaggio aggiuntivo.");
  }

  const contextLines = [
    payload.pageTitle
      ? `Pagina: ${payload.pageTitle}${payload.pagePath ? ` — ${payload.pagePath}` : ""}`
      : null,
    `Lingua della pagina: ${PAGE_LANGUAGE_LABEL[payload.locale ?? "it"]}`,
    `Dispositivo: ${DEVICE_LABEL[payload.deviceType ?? "desktop"]}`,
    `Orario: ${formatSubmittedAt()}`,
  ].filter((line): line is string => line !== null);
  if (payload.spamSignalsLine) {
    contextLines.push(payload.spamSignalsLine);
  }

  return {
    heading: isLibri ? "Richiesta del manuale" : "Nuovo contatto dal sito",
    openingLine: isLibri
      ? `${payload.nome} ha scaricato il manuale dal sito.`
      : `${payload.nome} ha scritto dal modulo.`,
    practicalBlock: { lines: personLines },
    secondaryBlock: { heading: "Contesto", lines: contextLines },
  };
}

// Download-flow copy pass — the guide download link, as its own line in
// the libri confirmation's practical block (an { label, href } line, not
// plain text — see emailTemplate.ts's own EmailPracticalLine comment for
// why: a raw URL sitting in running text isn't a real "download it
// again" affordance). pdfUrl is null both when no libriPage document
// exists for the locale and when one exists but guidePdf is still
// unset — same two cases LibriForm.tsx's own disabled-submit-button
// already guards against on the form itself (see that file's own
// comment). This is the SECOND guard: even if this function were ever
// reached with source:"libri" and no PDF (a direct API call bypassing
// the UI, or a PDF removed between page load and submit), the email
// still must not link to something that 404s — falls back to a plain,
// non-clickable line explaining the PDF isn't ready instead.
const DOWNLOAD_LINK_LABEL: Record<"it" | "en", string> = {
  it: "Scarica il manuale (PDF)",
  en: "Download the guide (PDF)",
};
const DOWNLOAD_LINK_UNAVAILABLE: Record<"it" | "en", string> = {
  it: "Il link di download non è disponibile al momento — verrà inviato non appena pronto.",
  en: "The download link isn't available right now — it will be sent as soon as it's ready.",
};

function downloadLinkLine(locale: "it" | "en", pdfUrl: string | null): EmailPracticalLine {
  return pdfUrl ? { label: DOWNLOAD_LINK_LABEL[locale], href: pdfUrl } : DOWNLOAD_LINK_UNAVAILABLE[locale];
}

// Confirmation to the visitor — real, final copy, both locales, both
// branches (ordinary contact vs. libri guide-download — distinct copy
// for each, per this pass's own instruction). pdfUrl is only read in the
// isLibri branch; callers pass null for the ordinary contact path where
// it's meaningless.
function buildConfirmationContent(
  payload: ContactMessagePayload,
  locale: "it" | "en",
  isLibri: boolean,
  pdfUrl: string | null,
): EmailContent {
  const canale = CANALE_PHRASES[locale][payload.channel];

  if (isLibri) {
    if (locale === "en") {
      return {
        heading: "The guide is yours",
        openingLine: `Hello ${payload.nome},`,
        bodyParagraphs: [
          "The guide opened in a new tab. If you cannot find it, the link below always works.",
          "It runs to twenty pages and takes about half an hour. It is not a course of therapy and does not replace a consultation: it is there to explain how anxiety and panic work, before you decide anything.",
        ],
        practicalBlock: {
          heading: "If you want to talk about it afterwards",
          lines: [
            downloadLinkLine(locale, pdfUrl),
            "WhatsApp — +39 339 190 1474",
            "Phone — +39 339 190 1474",
            "A first session lasts 45 minutes and commits you to nothing.",
          ],
        },
      };
    }
    return {
      heading: "Il manuale è tuo",
      openingLine: `Ciao ${payload.nome},`,
      bodyParagraphs: [
        "Il manuale si è aperto in una nuova scheda. Se non lo trovi, il link qui sotto funziona sempre.",
        "Sono venti pagine, si legge in mezz'ora. Non è un percorso e non sostituisce un colloquio: serve a capire come funzionano l'ansia e il panico, prima di decidere qualsiasi cosa.",
      ],
      practicalBlock: {
        heading: "Se dopo averlo letto vuoi parlarne",
        lines: [
          downloadLinkLine(locale, pdfUrl),
          "WhatsApp — +39 339 190 1474",
          "Telefono — +39 339 190 1474",
          "Il primo colloquio dura 45 minuti e non impegna a proseguire.",
        ],
      },
    };
  }

  if (locale === "en") {
    return {
      heading: "I have your message",
      openingLine: `Hello ${payload.nome},`,
      bodyParagraphs: [
        "Writing to confirm your message arrived. I read these myself — there is no receptionist in between.",
        `I will get back to you ${canale}, usually within 24 hours. If you wrote at the weekend it may be Monday.`,
        "There is nothing you need to do in the meantime.",
      ],
      practicalBlock: {
        heading: "If you need to reach me sooner",
        lines: [
          "WhatsApp — +39 339 190 1474",
          "Phone — +39 339 190 1474",
          "In an emergency or immediate danger, call 112 or go to the nearest emergency department. This address is not an emergency channel.",
        ],
      },
    };
  }
  return {
    heading: "Ho ricevuto il tuo messaggio",
    openingLine: `Ciao ${payload.nome},`,
    bodyParagraphs: [
      "Ti scrivo per confermarti che il tuo messaggio è arrivato. Lo leggo io, personalmente — non c'è una segreteria in mezzo.",
      `Ti ricontatto ${canale}, di solito entro 24 ore. Se scrivi nel fine settimana, può volerci fino al lunedì.`,
      "Non serve che tu faccia altro nel frattempo.",
    ],
    practicalBlock: {
      heading: "Se hai bisogno prima",
      lines: [
        "WhatsApp — +39 339 190 1474",
        "Telefono — +39 339 190 1474",
        "In caso di emergenza o pericolo immediato, chiama il 112 o recati al pronto soccorso più vicino. Questo indirizzo non è un canale di emergenza.",
      ],
    },
  };
}

const CONFIRMATION_SUBJECT: Record<"it" | "en", string> = {
  it: "Ho ricevuto il tuo messaggio — Dr. Giuseppe Iannone",
  en: "I have your message — Dr Giuseppe Iannone",
};
const LIBRI_CONFIRMATION_SUBJECT: Record<"it" | "en", string> = {
  it: "Il manuale è pronto — Dr. Giuseppe Iannone",
  en: "Your guide is ready — Dr Giuseppe Iannone",
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
  // is what a guide request actually carries instead.
  const isLibri = payload.source === "libri";

  // Internal notification — always Italian, always the same footer
  // (Giuseppe's own inbox, not locale-dependent).
  const internalFooterData = await getEmailFooterData("it");
  const internalContent = buildInternalContent(payload, isLibri);
  const internalHtml = renderEmailHtml(internalContent, footerLines("it"), internalFooterData, "it");
  const internalText = renderEmailText(internalContent, footerLines("it"), internalFooterData, "it");

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
        ? `Manuale richiesto dal sito — ${payload.nome}`
        : `Nuovo contatto dal sito — ${payload.nome}`,
      html: internalHtml,
      text: internalText,
      attachments: logoAttachment(),
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
    const locale = payload.locale ?? "it";
    const confirmationFooterData = await getEmailFooterData(locale);
    // Only fetched for the libri branch — the ordinary contact
    // confirmation never reads pdfUrl, no reason to hit Sanity for it.
    const pdfUrl = isLibri ? await getLibriGuidePdfUrl(locale) : null;
    const confirmationContent = buildConfirmationContent(payload, locale, isLibri, pdfUrl);
    const confirmationHtml = renderEmailHtml(confirmationContent, footerLines(locale), confirmationFooterData, locale);
    const confirmationText = renderEmailText(confirmationContent, footerLines(locale), confirmationFooterData, locale);

    await transporter.sendMail({
      from: EMAIL_USER,
      to: payload.email,
      subject: isLibri ? LIBRI_CONFIRMATION_SUBJECT[locale] : CONFIRMATION_SUBJECT[locale],
      html: confirmationHtml,
      text: confirmationText,
      attachments: logoAttachment(),
    });
  } catch (error) {
    console.error(
      "[contact] Confirmation email failed to send (internal notification already delivered):",
      error instanceof Error ? error.message : error,
    );
  }

  return { ok: true };
}
