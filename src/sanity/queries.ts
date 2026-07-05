import { defineQuery } from "next-sanity";

// Used to verify the client can reach the configured dataset (Step 5
// wiring proof). Real content queries are added alongside the schemas
// that back them, starting in Step 6.
export const healthCheckQuery = defineQuery(`count(*[])`);
