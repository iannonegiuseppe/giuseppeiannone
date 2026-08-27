import { urlFor } from "./image";

// Single-sourced contact-block photo — previously copy-pasted as a local
// const in 13 separate page files (12 still pointing at the old static
// design-lab headshot asset while the homepage alone had been updated to
// this cutout, which is exactly how that drift happened and went
// unnoticed for a while). One definition now; every caller imports it
// instead of declaring its own copy.
export const CONTACT_PHOTO_URL = urlFor({
  asset: { _ref: "image-d6d3563811d1c58fa2c57e23046164e4ab9be403-767x1542-png", _type: "reference" },
}).url();
export const CONTACT_PHOTO_ALT = "Giuseppe Iannone, ritratto.";
