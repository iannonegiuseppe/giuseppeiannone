import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// No secret validation needed here: disabling draft mode only reduces
// access (back to published-only), it never grants anything, so anyone
// hitting this route is safe.
export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
