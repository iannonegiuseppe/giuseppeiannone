import { NextResponse } from "next/server";
import { issueFormToken } from "@/lib/contact/formToken";

// Contact form hardening pass — issues the signed token ContactForm/
// LibriForm fetch on mount and submit alongside /api/contact. See
// formToken.ts's own comment for what the token actually encodes and why.
export const runtime = "nodejs";
// No cookies/headers are read here, so nothing about this route
// automatically opts it out of static optimization the way draft-mode's
// routes do — force it explicitly. A cached response would hand every
// visitor the same iat, defeating the "under 3 seconds is a bot" check
// for everyone after the first.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ token: issueFormToken() });
}
