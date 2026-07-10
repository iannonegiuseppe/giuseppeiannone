// Single source for the channel list — consumed by both MiniContactBand.tsx
// (block 10) and ChannelPickerDialog.tsx (the header's "Prenota un primo
// colloquio" popup, Part B). One WhatsApp button + two text links,
// matching the "exactly ONE button, the rest are text links" rule both
// surfaces share. Every href below is a [segnaposto] pending the client's
// confirmation of which channels he actually answers on — "only channels
// he actually answers on get published" (unchanged reasoning from the
// mini-contact band's own original comment).
export type ContactChannel = {
  id: "whatsapp" | "phone" | "email";
  label: string;
  href: string;
};

export const contactChannels: ContactChannel[] = [
  {
    id: "whatsapp",
    // [segnaposto — wa.me link] real WhatsApp deep link
    // (https://wa.me/<number>) once the client confirms the number this
    // channel should publish.
    label: "Scrivimi su WhatsApp",
    href: "#",
  },
  {
    id: "phone",
    // [segnaposto — telefono]: real number pending confirmation.
    label: "[segnaposto — telefono]",
    href: "tel:+390000000000",
  },
  {
    id: "email",
    // [segnaposto — email]: real address pending confirmation.
    label: "[segnaposto — email]",
    href: "mailto:info@example.com",
  },
];
