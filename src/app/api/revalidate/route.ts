import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { type NextRequest, NextResponse } from "next/server";

interface WebhookPayload {
  _type: string;
  slug?: { current?: string };
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    console.error("SANITY_REVALIDATE_SECRET is not configured");
    return NextResponse.json({ message: "Server misconfigured" }, { status: 500 });
  }

  let body: WebhookPayload | null;
  let isValidSignature: boolean | null;

  try {
    // Skip the eventual-consistency wait: we only invalidate cache tags
    // here, we don't re-query Sanity within this request, so there's
    // nothing that needs replication to have caught up yet.
    ({ isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      secret,
      false,
    ));
  } catch (error) {
    console.error("Failed to parse revalidation webhook payload", error);
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  if (isValidSignature !== true) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  if (!body?._type) {
    return NextResponse.json({ message: "Missing _type in payload" }, { status: 400 });
  }

  // Always revalidate the type-wide tag, on every change, regardless of
  // references. Correctness over cleverness: a stale page is worse than
  // an occasionally over-broad revalidation. This also covers documents
  // embedded by reference elsewhere (relatedTopics, faqBlock,
  // conditionCard/treatmentCard, subtopicPage's parent pillar) and
  // translation pairs, none of which get their own targeted invalidation
  // yet — see README for where finer-grained per-reference invalidation
  // would go later.
  // { expire: 0 }: immediate expiration, not the "max" stale-while-
  // revalidate profile — a webhook-triggered publish should make the
  // next visitor see fresh content, not one more stale response.
  revalidateTag(body._type, { expire: 0 });

  if (body.slug?.current) {
    revalidateTag(`${body._type}:${body.slug.current}`, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
