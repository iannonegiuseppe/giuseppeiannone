import { createHmac, timingSafeEqual } from "crypto";

// Contact form hardening pass — the signed-token layer. A GET request to
// /api/contact-token (issueFormToken, called from there) hands the page a
// token the moment ContactForm/LibriForm mounts; POST /api/contact
// (verifyFormToken) refuses to send anything without a currently-valid
// one. This is deliberately the SAME mechanism as the "under 3 seconds is
// a bot" timestamp check, not a second one: the token's own iat IS the
// render timestamp, signed alongside its exp in one HMAC. A plain hidden
// timestamp field can't work as an anti-forgery measure on its own — a
// script posting directly to the endpoint can set it to anything — so the
// timestamp only means something once it can't be altered without
// invalidating a signature the client has no way to produce (the secret
// never leaves the server; see CONTACT_FORM_TOKEN_SECRET below).
const TOKEN_LIFETIME_MS = 30 * 60 * 1000; // 30 minutes
const MIN_FILL_TIME_MS = 3_000; // matches "under three seconds is rejected"

function getSecret(): string {
  const secret = process.env.CONTACT_FORM_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      "CONTACT_FORM_TOKEN_SECRET is not set — required to issue or verify contact-form tokens. " +
        "Set it in .env.local and in Vercel's environment variables (never commit the value).",
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function issueFormToken(): string {
  const iat = Date.now();
  const exp = iat + TOKEN_LIFETIME_MS;
  const payload = `${iat}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export type FormTokenVerifyResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "malformed" | "invalid-signature" | "too-fast" | "expired" };

export function verifyFormToken(token: string | undefined | null): FormTokenVerifyResult {
  if (!token) return { ok: false, reason: "missing" };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const [iatStr, expStr, sig] = parts as [string, string, string];
  const iat = Number(iatStr);
  const exp = Number(expStr);
  if (!Number.isFinite(iat) || !Number.isFinite(exp)) return { ok: false, reason: "malformed" };

  const expectedSig = sign(`${iatStr}.${expStr}`);
  const provided = Buffer.from(sig, "hex");
  const expected = Buffer.from(expectedSig, "hex");
  // Length check first — timingSafeEqual throws on mismatched lengths
  // rather than returning false, and the length check itself leaks
  // nothing an attacker doesn't already know (hex-encoded SHA-256 is
  // always 64 chars for a well-formed token).
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return { ok: false, reason: "invalid-signature" };
  }

  const now = Date.now();
  if (now - iat < MIN_FILL_TIME_MS) return { ok: false, reason: "too-fast" };
  if (now > exp) return { ok: false, reason: "expired" };

  return { ok: true };
}
