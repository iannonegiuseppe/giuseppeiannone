import { useEditState, useFormValue } from "sanity";
import type { SlugInputProps } from "sanity";

// Locks the slug field once THIS document has a published version — not
// the document's translation siblings, and not just "is currently a
// draft" (every unpublished document, including a brand-new translation
// pair, is also a draft). Schema-level `readOnly` callbacks are
// synchronous with no dataset access (see structure.ts/slug fields for
// why this needs a custom input instead), so this reads live publish
// state via useEditState.
export function SlugLockedAfterPublish(props: SlugInputProps) {
  const documentId = useFormValue(["_id"]) as string | undefined;
  const documentType = useFormValue(["_type"]) as string;
  const publishedId = (documentId ?? "").replace(/^drafts\./, "");

  const editState = useEditState(publishedId, documentType);
  const isPublished = Boolean(editState.published);

  return props.renderDefault({
    ...props,
    readOnly: props.readOnly || isPublished,
  });
}
