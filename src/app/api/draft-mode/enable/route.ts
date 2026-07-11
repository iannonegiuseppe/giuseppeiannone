import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/client";

// validatePreviewUrl (inside defineEnableDraftMode) checks the request's
// signed secret against a sanity.previewUrlSecret document — an invalid
// or missing secret gets a 401, never a bare toggle. The secret is only
// ever created by Sanity's own Presentation tool for an authenticated
// Studio session.
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({
    token: process.env.SANITY_API_PREVIEW_TOKEN,
  }),
});
