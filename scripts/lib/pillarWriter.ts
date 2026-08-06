import type { SanityClient } from "@sanity/client";

// Shared write helpers for the pillar rollout population scripts.
// createIfNotExists + patch.set only, per the project's standing
// convention — never createOrReplace, so a re-run never wipes fields
// written by a previous partial run.
export async function upsertDoc(
  client: SanityClient,
  id: string,
  type: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await client.createIfNotExists({ _id: id, _type: type });
  await client.patch(id).set(fields).commit();
  console.log(`\n--- ${id} ---`);
  console.log(JSON.stringify(fields, null, 2));
}

export async function upsertTranslationMetadata(
  client: SanityClient,
  metadataKey: string,
  schemaType: string,
  itId: string,
  enId: string,
): Promise<void> {
  const id = `translation.metadata.${metadataKey}`;
  await client.createIfNotExists({
    _id: id,
    _type: "translation.metadata",
    schemaTypes: [schemaType],
  });
  await client
    .patch(id)
    .set({
      schemaTypes: [schemaType],
      translations: [
        { _key: "it", _type: "internationalizedArrayReferenceValue", language: "it", value: { _ref: itId, _type: "reference" } },
        { _key: "en", _type: "internationalizedArrayReferenceValue", language: "en", value: { _ref: enId, _type: "reference" } },
      ],
    })
    .commit();
  console.log(`\n--- ${id} ---`);
  console.log(`it -> ${itId}, en -> ${enId}`);
}
