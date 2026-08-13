"use client";

import { useRef } from "react";
import { Button, ButtonLink } from "@/components/Button";
import {
  ContactFormDialog,
  type ContactFormDialogHandle,
} from "@/components/ContactFormDialog";
import type { Locale } from "@/sanity/paths";
import styles from "./heroVideoActions.module.scss";

// Hero's two action buttons (video-background variant only). Reuses two
// existing mechanisms rather than rebuilding either: the SAME
// ContactFormDialog component WelcomeBlock's "Scrivimi" opens (a second,
// independent instance — not a shared ref across two unrelated trigger
// points, matching how every other reused component in this codebase
// works), and the shared Button component's new "glass" variant.
//
// Client-only by design, kept OUT of HeroOverlap.tsx itself (a real,
// shared, server-rendered component) — passed in as a pre-rendered
// ReactNode via the `actions` prop, same pattern already established for
// `backgroundMedia`.
export function HeroVideoActions({
  areeHref,
  areeLabel,
  contactLabel,
  locale,
  closeLabel,
  contactDialogHeading,
}: {
  areeHref: string;
  areeLabel: string;
  contactLabel: string;
  locale: Locale;
  closeLabel: string;
  contactDialogHeading: string;
}) {
  const contactDialogRef = useRef<ContactFormDialogHandle>(null);

  return (
    <div className={styles.row}>
      <ButtonLink href={areeHref} variant="glass">
        {areeLabel}
      </ButtonLink>
      <Button type="button" variant="glass" onClick={() => contactDialogRef.current?.open()}>
        {contactLabel}
      </Button>
      <ContactFormDialog
        ref={contactDialogRef}
        locale={locale}
        closeLabel={closeLabel}
        heading={contactDialogHeading}
      />
    </div>
  );
}
