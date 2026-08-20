import { NextResponse, type NextRequest } from "next/server";
import { sendContactMessage } from "@/lib/contact/sender";
import { isRateLimited } from "@/lib/contact/rateLimit";
import { verifyFormToken } from "@/lib/contact/formToken";
import { detectSpamSignals, formatSpamSignalsLine } from "@/lib/contact/contentSignals";
import {
  validateContactForm,
  type ContactChannel,
  type ContactFormValues,
} from "@/lib/contact/validation";

// nodemailer needs Node APIs (net/tls) unavailable on the Edge runtime —
// explicit even though Node is Next's own default for route handlers, so
// this doesn't silently break if that default ever changes.
export const runtime = "nodejs";

interface ContactRequestBody {
  nome?: unknown;
  channel?: unknown;
  email?: unknown;
  telefono?: unknown;
  messaggio?: unknown;
  consent?: unknown;
  // Honeypot — a real visitor never fills this (it's visually hidden and
  // excluded from tab order); any non-empty value means a bot filled
  // every field it could find. Silently accept (200) so the bot has no
  // signal to react to, but never actually send.
  companyWebsite?: unknown;
  // Libri download pass — both optional and additive, see sender.ts's own
  // comment on ContactMessagePayload: omitting either preserves today's
  // contact-form behavior exactly.
  source?: unknown;
  marketingConsent?: unknown;
  // Hardening pass — formToken.ts's own signed token (see that file's
  // top comment) and the visitor's locale, threaded through for the
  // confirmation email's language (see sender.ts's buildConfirmationEmail).
  formToken?: unknown;
  locale?: unknown;
}

const VALID_CHANNELS: ContactChannel[] = ["whatsapp", "telefonata", "email"];

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: "Troppe richieste. Riprova tra qualche minuto." },
      { status: 429 },
    );
  }

  let body: ContactRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Richiesta non valida." }, { status: 400 });
  }

  if (typeof body.companyWebsite === "string" && body.companyWebsite.length > 0) {
    // The honeypot's own response is a silent 200 by design — a bot gets
    // no signal it was caught. That silence means a false positive (a
    // real visitor's browser autofilling the field — confirmed live,
    // Android Chrome's Autofill did exactly this) is otherwise invisible
    // too. This line is the fix for THAT: it shows up in the Vercel log
    // even though the response itself stays a plain success. IP only,
    // never the field's own value — logging what was typed into a
    // honeypot would defeat rewriting its name to avoid exactly this
    // kind of accidental data capture.
    console.log(`[contact] Honeypot triggered — request rejected silently. ip=${ip}`);
    return NextResponse.json({ ok: true });
  }

  // Hardening pass — the layer that actually stops a script posting
  // directly to this endpoint: without a currently-valid, server-signed
  // token, the request is refused outright. "expired" gets its own code
  // so the client can silently fetch a fresh token and resubmit once
  // (see ContactForm.tsx/LibriForm.tsx's own retry) rather than losing
  // whatever the visitor typed — everything else (missing, malformed, bad
  // signature, submitted too fast to be human) is a flat, unhelpful
  // rejection; a real browser that fetched its token on mount never hits
  // any of those in normal use.
  const formToken = typeof body.formToken === "string" ? body.formToken : undefined;
  const tokenResult = verifyFormToken(formToken);
  if (!tokenResult.ok) {
    if (tokenResult.reason === "expired") {
      return NextResponse.json(
        { message: "La sessione del modulo è scaduta.", code: "token-expired" },
        { status: 401 },
      );
    }
    return NextResponse.json({ message: "Richiesta non valida." }, { status: 403 });
  }

  const nome = typeof body.nome === "string" ? body.nome : "";
  const channel = VALID_CHANNELS.includes(body.channel as ContactChannel)
    ? (body.channel as ContactChannel)
    : null;
  const email = typeof body.email === "string" ? body.email : "";
  const telefono = typeof body.telefono === "string" ? body.telefono : "";
  const messaggio = typeof body.messaggio === "string" ? body.messaggio : "";
  const consent = body.consent === true;
  const source = body.source === "libri" ? "libri" : "contact";
  const marketingConsent = body.marketingConsent === true;
  const locale = body.locale === "en" ? "en" : "it";

  const values: ContactFormValues = { nome, channel, email, telefono, messaggio, consent };
  const errors = validateContactForm(values);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Dati non validi.", errors }, { status: 400 });
  }

  // Hardening pass — flags only, computed from the visitor's own message;
  // never blocks, never reaches the visitor. See contentSignals.ts's own
  // comment for why and formatSpamSignalsLine for why a clean message
  // gets no line at all rather than a reassuring "nothing found" one.
  const spamSignalsLine = formatSpamSignalsLine(detectSpamSignals(messaggio));

  // channel is guaranteed non-null past validateContactForm (validateChannel
  // would have populated errors.channel otherwise, caught above).
  const result = await sendContactMessage({
    nome: nome.trim(),
    channel: channel as ContactChannel,
    email: email.trim(),
    telefono: telefono.trim(),
    messaggio: messaggio.trim(),
    source,
    marketingConsent,
    locale,
    spamSignalsLine: spamSignalsLine ?? undefined,
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: "Invio non riuscito. Riprova o scrivimi direttamente." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
