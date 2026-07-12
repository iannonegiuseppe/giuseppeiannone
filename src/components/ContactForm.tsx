"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ContactFormInput, ContactFormTextarea } from "./ContactFormField";
import type { ContactFieldHandle } from "./ContactFormField";
import { privacyPath, type Locale } from "@/sanity/paths";
import {
  validateContact,
  validateContactForm,
  validateNome,
  type ContactChannel,
  type ContactFormErrors,
  type ContactFormValues,
} from "@/lib/contact/validation";
import styles from "./ContactForm.module.scss";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const CHANNEL_OPTIONS: { value: ContactChannel; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telefonata", label: "Telefonata" },
  { value: "email", label: "Email" },
];

// Compact-pass revision: pre-selected so the "Numero" field is visible
// from the very first paint, not just after a manual choice. A plain
// non-null useState initializer renders identically during SSR and the
// initial client render (same as defaultChecked would) — there is no
// separate client-only effect setting this after hydration, so it's
// never a pop-in.
const DEFAULT_CHANNEL: ContactChannel = "whatsapp";

const CHANNEL_PHRASES: Record<ContactChannel, string> = {
  whatsapp: "su WhatsApp",
  telefonata: "al telefono",
  email: "via email",
};

// Replaces FinalContactSection's old single CTA button — a structured
// contact path alongside the header popup/mini-contact band (both stay
// untouched; they serve low-threshold contact). Copy is hardcoded per
// spec, not CMS-sourced: this is a code-owned form, not editorial
// content.
// tight: mirrors the old button's own .finalContactCtaTight — halves this
// form's top margin when the availability badge (rendered just above, by
// FinalContactSection) is present, same "two smaller gaps replace one
// larger gap" spacing rule as everywhere else that badge appears.
// Handled internally via a data-attribute (not an externally-applied
// className) so the override can never lose a cross-module CSS
// specificity race — see HeaderInteractive.module.scss's own documented
// incident with exactly that failure mode.
export function ContactForm({
  locale,
  tight,
  responseNote,
}: {
  locale: Locale;
  tight?: boolean;
  responseNote?: string;
}) {
  const [channel, setChannel] = useState<ContactChannel | null>(DEFAULT_CHANNEL);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submittedNome, setSubmittedNome] = useState("");
  const [submittedChannel, setSubmittedChannel] = useState<ContactChannel | null>(null);

  const nomeRef = useRef<ContactFieldHandle>(null);
  const firstChannelRadioRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<ContactFieldHandle>(null);
  const messaggioRef = useRef<ContactFieldHandle>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const channelGroupId = useId();
  const honeypotId = useId();

  function focusFirstError(fieldErrors: ContactFormErrors) {
    if (fieldErrors.nome) {
      nomeRef.current?.focus();
    } else if (fieldErrors.channel) {
      firstChannelRadioRef.current?.focus();
    } else if (fieldErrors.contact) {
      contactRef.current?.focus();
    } else if (fieldErrors.consent) {
      consentRef.current?.focus();
    }
  }

  function handleChannelChange(value: ContactChannel) {
    setChannel(value);
    // Switching channels preserves nothing — the dynamic contact field is
    // keyed by channel below, so it remounts empty; clear any stale
    // error from the previous channel's own validation too.
    setErrors((prev) => ({ ...prev, channel: undefined, contact: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nome = nomeRef.current?.getValue() ?? "";
    const contact = contactRef.current?.getValue() ?? "";
    const messaggio = messaggioRef.current?.getValue() ?? "";
    const consent = consentRef.current?.checked ?? false;
    const honeypot = honeypotRef.current?.value ?? "";

    const values: ContactFormValues = { nome, channel, contact, messaggio, consent };
    const validationErrors = validateContactForm(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      focusFirstError(validationErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          channel,
          contact: contact.trim(),
          messaggio: messaggio.trim(),
          consent,
          companyWebsite: honeypot,
        }),
      });

      if (res.ok) {
        setSubmittedNome(nome.trim());
        setSubmittedChannel(channel);
        setStatus("success");
        return;
      }

      if (res.status === 400) {
        const data: { errors?: ContactFormErrors } | null = await res.json().catch(() => null);
        if (data?.errors) {
          setErrors(data.errors);
          focusFirstError(data.errors);
          setStatus("idle");
          return;
        }
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" && submittedChannel) {
    // Replaces the form in place, no redirect — the availability badge
    // (rendered by FinalContactSection, above this component) stays
    // visible regardless, since this only replaces ContactForm's own
    // output. "di solito" (usually) states the response time as fact,
    // not a promise — per §9 (no guaranteed-response wording).
    return (
      <p className={styles.successMessage} data-tight={tight}>
        {`Grazie, ${submittedNome}. Ti ricontatto io ${CHANNEL_PHRASES[submittedChannel]} — di solito entro [segnaposto — tempo di risposta].`}
      </p>
    );
  }

  const contactLabel = channel === "email" ? "Email" : "Numero";

  return (
    <form className={styles.contactForm} data-tight={tight} onSubmit={handleSubmit} noValidate>
      {status === "error" ? (
        <div className={styles.formBanner} role="alert">
          <p className={styles.formBannerText}>
            Qualcosa non ha funzionato. Puoi scrivermi direttamente su WhatsApp: [segnaposto]
          </p>
        </div>
      ) : null}

      <ContactFormInput
        label="Nome"
        name="nome"
        required
        ref={nomeRef}
        error={errors.nome}
        onBlurValue={(value) => setErrors((prev) => ({ ...prev, nome: validateNome(value) }))}
      />

      <fieldset className={styles.pillFieldset} aria-describedby={errors.channel ? `${channelGroupId}-error` : undefined}>
        <legend className={styles.pillLegend}>Come preferisci essere ricontattato?</legend>
        <div className={styles.pillGroup}>
          {CHANNEL_OPTIONS.map((option, index) => (
            <label key={option.value} className={styles.pill} data-selected={channel === option.value}>
              <input
                ref={index === 0 ? firstChannelRadioRef : undefined}
                type="radio"
                name="channel"
                value={option.value}
                checked={channel === option.value}
                onChange={() => handleChannelChange(option.value)}
                className={styles.pillInput}
                required
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {errors.channel ? (
          <p id={`${channelGroupId}-error`} className={styles.groupError} role="alert">
            {errors.channel}
          </p>
        ) : null}
      </fieldset>

      {channel ? (
        <ContactFormInput
          key={channel}
          label={contactLabel}
          name="contact"
          required
          ref={contactRef}
          error={errors.contact}
          type={channel === "email" ? "email" : "text"}
          inputMode={channel === "email" ? "email" : "tel"}
          autoComplete={channel === "email" ? "email" : "tel"}
          onBlurValue={(value) =>
            setErrors((prev) => ({ ...prev, contact: validateContact(channel, value) }))
          }
        />
      ) : null}

      <ContactFormTextarea
        label="Se vuoi, scrivi due righe — anche solo un saluto"
        name="messaggio"
        ref={messaggioRef}
      />

      {/* Declutter pass: the error <p> lives in this wrapping div, not
          inside the <label> itself — <label>'s content model only
          allows phrasing (inline) content, and a block-level <p> in
          there would also risk being absorbed into the checkbox's own
          accessible name via implicit label association. The div is
          just the position:relative anchor the hanging-error treatment
          measures from (top: 100%), same mechanism as the field
          errors — see ContactForm.module.scss's own comment. */}
      <div className={styles.consentWrap}>
        <label className={styles.consentRow}>
          <input
            type="checkbox"
            name="consent"
            ref={consentRef}
            className={styles.consentCheckbox}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${channelGroupId}-consent-error` : undefined}
            onChange={() => setErrors((prev) => ({ ...prev, consent: undefined }))}
          />
          <span className={styles.consentText}>
            Ho letto l&apos;
            {/* Route may 404 until the privacy page is actually built —
                same "ship structure now" policy as every other pending
                route referenced elsewhere in this codebase (header/footer
                nav, footer legal column). */}
            <Link href={privacyPath(locale)} className={styles.consentLink}>
              informativa sulla privacy
            </Link>
            {" "}e acconsento al trattamento dei dati.
          </span>
        </label>
        {errors.consent ? (
          <p id={`${channelGroupId}-consent-error`} className={styles.groupError} role="alert">
            {errors.consent}
          </p>
        ) : null}
      </div>
      {responseNote ? <p className={styles.responseLine}>{responseNote}</p> : null}

      {/* Honeypot — off-screen (not display:none, so naive bots still
          "see" and fill it), excluded from tab order and screen readers.
          Any value here means a bot filled every field it could find;
          the server silently accepts (200) without sending. */}
      <div className={styles.honeypotWrap} aria-hidden="true">
        <label htmlFor={honeypotId}>Non compilare questo campo</label>
        <input
          id={honeypotId}
          type="text"
          name="companyWebsite"
          ref={honeypotRef}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Declutter pass: nothing renders below the submit button anymore
          — the form's own quiet line is deleted, and the only surviving
          trust line (responseNote) now sits under the consent row
          instead, per spec's explicit "below the submit button there is
          NOTHING." */}
      <button type="submit" className={styles.submitButton} disabled={status === "submitting"}>
        {status === "submitting" ? "Invio…" : "Invia il messaggio"}
      </button>
    </form>
  );
}
