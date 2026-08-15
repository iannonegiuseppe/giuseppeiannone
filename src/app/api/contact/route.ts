import { NextResponse, type NextRequest } from "next/server";
import { sendContactMessage } from "@/lib/contact/sender";
import { isRateLimited } from "@/lib/contact/rateLimit";
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
    return NextResponse.json({ ok: true });
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

  const values: ContactFormValues = { nome, channel, email, telefono, messaggio, consent };
  const errors = validateContactForm(values);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Dati non validi.", errors }, { status: 400 });
  }

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
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: "Invio non riuscito. Riprova o scrivimi direttamente." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
