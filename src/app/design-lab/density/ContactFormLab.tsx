"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/Button";
import { ContactFormInput, ContactFormTextarea } from "./ContactFormFieldLab";
import type { ContactFieldHandle } from "./ContactFormFieldLab";
import { privacyPath, type Locale } from "@/sanity/paths";
import {
  validateChannel,
  validateConsent,
  validateEmail,
  validateNome,
  validatePhone,
  type ContactChannel,
} from "@/lib/contact/validation";
import styles from "./contactFormLab.module.scss";

// Forked from src/components/ContactForm.tsx (shared with the real,
// production-serving ContactForm, rendered via FinalContactSection.tsx —
// confirmed by reading that file directly). This pass is layout + light-
// surface only: src/lib/contact/validation.ts, src/app/api/contact/
// route.ts and sender.ts are all untouched, and ContactFormValues/the API
// payload keep their existing shape (single `contact` key). See the TODO
// below handleSubmit for exactly what changes once telefono gets real
// wiring — this fork does not call validateContactForm/validateContact
// (the shared dispatcher keyed by channel) at all, since that dispatcher's
// "contact is phone unless channel is email" logic doesn't fit this pass's
// model (email is always required regardless of channel); instead it calls
// the finer-grained exported validators (validateNome/validateEmail/
// validatePhone/validateChannel/validateConsent) individually — all still
// imported, unmodified, pure functions from the real validation module.
//
// Error MESSAGES are this fork's own bilingual copy, not the strings
// validation.ts's functions return (those are Italian-only, hardcoded) —
// each validator is used purely as a boolean pass/fail signal here so an
// English-locale visitor sees English error text; the underlying pass/fail
// LOGIC is still exactly what validation.ts already enforces.

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const DEFAULT_CHANNEL: ContactChannel = "whatsapp";
const WHATSAPP_FALLBACK_DISPLAY = "+39 339 190 1474";

interface ContactLabFormErrors {
  nome?: string;
  telefono?: string;
  email?: string;
  channel?: string;
  consent?: string;
}

const COPY = {
  it: {
    fieldLabels: {
      nome: "Nome",
      telefono: "Numero (facoltativo)",
      email: "Email",
      messaggio: "Se vuoi, scrivi due righe — anche solo un saluto",
    },
    channelLegend: "Come preferisci essere ricontattato?",
    channelOptions: [
      { value: "whatsapp" as ContactChannel, label: "WhatsApp" },
      { value: "telefonata" as ContactChannel, label: "Telefonata" },
      { value: "email" as ContactChannel, label: "Email" },
    ],
    consentLinkText: "informativa sulla privacy",
    submitLabel: "Invia il messaggio",
    submitLabelBusy: "Invio…",
    errors: {
      nome: "Il nome è obbligatorio.",
      email: "L'indirizzo email non sembra completo.",
      telefono: "Controlla il numero: sembra troppo corto.",
      channel: "Scegli come preferisci essere ricontattato.",
      consent: "Per inviare serve il consenso privacy.",
    },
    channelPhrases: { whatsapp: "su WhatsApp", telefonata: "al telefono", email: "via email" } as Record<ContactChannel, string>,
    successMessage: (nome: string, channelPhrase: string) =>
      `Grazie, ${nome}. Ti ricontatto io ${channelPhrase} — di solito entro [segnaposto — tempo di risposta].`,
    genericError: `Qualcosa non ha funzionato. Puoi scrivermi direttamente su WhatsApp: ${WHATSAPP_FALLBACK_DISPLAY}`,
    honeypotLabel: "Non compilare questo campo",
  },
  en: {
    fieldLabels: {
      nome: "Name",
      telefono: "Phone (optional)",
      email: "Email",
      messaggio: "If you like, write a few lines — even just hello",
    },
    channelLegend: "How would you prefer to be contacted?",
    channelOptions: [
      { value: "whatsapp" as ContactChannel, label: "WhatsApp" },
      { value: "telefonata" as ContactChannel, label: "Phone call" },
      { value: "email" as ContactChannel, label: "Email" },
    ],
    consentLinkText: "privacy policy",
    submitLabel: "Send the message",
    submitLabelBusy: "Sending…",
    errors: {
      nome: "Name is required.",
      email: "That email address doesn't look complete.",
      telefono: "Check the number: it looks too short.",
      channel: "Choose how you'd prefer to be contacted.",
      consent: "Consent is required to send this.",
    },
    channelPhrases: { whatsapp: "on WhatsApp", telefonata: "by phone", email: "by email" } as Record<ContactChannel, string>,
    successMessage: (nome: string, channelPhrase: string) =>
      `Thanks, ${nome}. I'll get back to you ${channelPhrase} — usually within [placeholder — response time].`,
    genericError: `Something didn't work. You can write to me directly on WhatsApp: ${WHATSAPP_FALLBACK_DISPLAY}`,
    honeypotLabel: "Don't fill in this field",
  },
};

export function ContactFormLab({ locale, replyLine }: { locale: Locale; replyLine: string }) {
  const t = COPY[locale];

  const [channel, setChannel] = useState<ContactChannel | null>(DEFAULT_CHANNEL);
  const [errors, setErrors] = useState<ContactLabFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submittedNome, setSubmittedNome] = useState("");
  const [submittedChannel, setSubmittedChannel] = useState<ContactChannel | null>(null);

  const nomeRef = useRef<ContactFieldHandle>(null);
  const telefonoRef = useRef<ContactFieldHandle>(null);
  const emailRef = useRef<ContactFieldHandle>(null);
  const messaggioRef = useRef<ContactFieldHandle>(null);
  const firstChannelRadioRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const channelGroupId = useId();
  const honeypotId = useId();

  function focusFirstError(fieldErrors: ContactLabFormErrors) {
    if (fieldErrors.nome) {
      nomeRef.current?.focus();
    } else if (fieldErrors.telefono) {
      telefonoRef.current?.focus();
    } else if (fieldErrors.email) {
      emailRef.current?.focus();
    } else if (fieldErrors.channel) {
      firstChannelRadioRef.current?.focus();
    } else if (fieldErrors.consent) {
      consentRef.current?.focus();
    }
  }

  function handleChannelChange(value: ContactChannel) {
    setChannel(value);
    setErrors((prev) => ({ ...prev, channel: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nome = nomeRef.current?.getValue() ?? "";
    const telefono = telefonoRef.current?.getValue() ?? "";
    const email = emailRef.current?.getValue() ?? "";
    const messaggio = messaggioRef.current?.getValue() ?? "";
    const consent = consentRef.current?.checked ?? false;
    const honeypot = honeypotRef.current?.value ?? "";

    const fieldErrors: ContactLabFormErrors = {};
    if (validateNome(nome)) fieldErrors.nome = t.errors.nome;
    if (telefono.trim() && validatePhone(telefono)) fieldErrors.telefono = t.errors.telefono;
    if (validateEmail(email)) fieldErrors.email = t.errors.email;
    if (validateChannel(channel)) fieldErrors.channel = t.errors.channel;
    if (validateConsent(consent)) fieldErrors.consent = t.errors.consent;

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      // TODO(contact-wiring): telefono is LOCAL STATE ONLY in this pass —
      // it is deliberately not sent below. The later pass that wires it
      // for real needs to: (1) add a `telefono` key to ContactFormValues
      // (src/lib/contact/validation.ts) and to route.ts's
      // ContactRequestBody/ContactFormErrors; (2) make it required exactly
      // when channel is "whatsapp" or "telefonata" (a conditional rule
      // replacing validateContact's current channel dispatch); (3) decide
      // how sender.ts's single `contact`/"Recapito" line represents two
      // values once both are collected.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          channel,
          contact: email.trim(),
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

      // A 400 here (distinct from the client-side checks above) means the
      // server's own validateContact(channel, contact) rejected the email
      // value as a phone number — happens whenever channel is "whatsapp"
      // or "telefonata", since contact is always the email field's value
      // in this pass (see the TODO above). No per-field mapping attempted
      // (the server's error shape is keyed by `contact`, not this fork's
      // `email`/`telefono` split) — same generic banner as any other
      // failure, an honest surface rather than silently doing nothing.
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" && submittedChannel) {
    return (
      <p className={styles.successMessage}>
        {t.successMessage(submittedNome, t.channelPhrases[submittedChannel])}
      </p>
    );
  }

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
      {status === "error" ? (
        <div className={styles.formBanner} role="alert">
          <p className={styles.formBannerText}>{t.genericError}</p>
        </div>
      ) : null}

      {/* Row 1: Nome | Numero (facoltativo) — equal width at sm+. */}
      <div className={styles.fieldRow}>
        <ContactFormInput
          label={t.fieldLabels.nome}
          name="nome"
          required
          ref={nomeRef}
          error={errors.nome}
          onBlurValue={(value) =>
            setErrors((prev) => ({
              ...prev,
              // Untouched (never typed into) must not error on blur, required
              // or not — only a non-empty value gets validated here. Submit's
              // own check (below) is what still catches an empty required
              // field on attempted submit.
              nome: value.trim() && validateNome(value) ? t.errors.nome : undefined,
            }))
          }
          onChangeValue={(value) => {
            // Clears the moment the field becomes valid, no second blur
            // needed — only acts while an error is already showing, so typing
            // in a field with no error yet never introduces one mid-keystroke.
            if (errors.nome && !validateNome(value)) {
              setErrors((prev) => ({ ...prev, nome: undefined }));
            }
          }}
        />
        <ContactFormInput
          label={t.fieldLabels.telefono}
          name="telefono"
          ref={telefonoRef}
          error={errors.telefono}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          onBlurValue={(value) =>
            setErrors((prev) => ({
              ...prev,
              telefono: value.trim() && validatePhone(value) ? t.errors.telefono : undefined,
            }))
          }
          onChangeValue={(value) => {
            if (errors.telefono && (!value.trim() || !validatePhone(value))) {
              setErrors((prev) => ({ ...prev, telefono: undefined }));
            }
          }}
        />
      </div>

      {/* Row 2: Email, full width — always required regardless of channel. */}
      <ContactFormInput
        label={t.fieldLabels.email}
        name="email"
        required
        ref={emailRef}
        error={errors.email}
        type="email"
        inputMode="email"
        autoComplete="email"
        onBlurValue={(value) =>
          setErrors((prev) => ({
            ...prev,
            email: value.trim() && validateEmail(value) ? t.errors.email : undefined,
          }))
        }
        onChangeValue={(value) => {
          if (errors.email && !validateEmail(value)) {
            setErrors((prev) => ({ ...prev, email: undefined }));
          }
        }}
      />

      {/* Row 3: message, full width. */}
      <ContactFormTextarea label={t.fieldLabels.messaggio} name="messaggio" ref={messaggioRef} />

      <fieldset className={styles.pillFieldset} aria-describedby={errors.channel ? `${channelGroupId}-error` : undefined}>
        <legend className={styles.pillLegend}>{t.channelLegend}</legend>
        <div className={styles.pillGroup}>
          {t.channelOptions.map((option, index) => (
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

      {/* Consent stays ABOVE the submit button, unchecked by default,
          blocking submission until checked — deliberate deviation from the
          reference (which places it below the button). Never pre-checked,
          never opt-out. */}
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
            {locale === "en" ? (
              <>
                I have read the{" "}
                <Link href={privacyPath(locale)} className={styles.consentLink}>
                  {t.consentLinkText}
                </Link>{" "}
                and consent to the processing of my data.
              </>
            ) : (
              <>
                Ho letto l&apos;
                <Link href={privacyPath(locale)} className={styles.consentLink}>
                  {t.consentLinkText}
                </Link>{" "}
                e acconsento al trattamento dei dati.
              </>
            )}
          </span>
        </label>
        {errors.consent ? (
          <p id={`${channelGroupId}-consent-error`} className={styles.groupError} role="alert">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className={styles.honeypotWrap} aria-hidden="true">
        <label htmlFor={honeypotId}>{t.honeypotLabel}</label>
        <input id={honeypotId} type="text" name="companyWebsite" ref={honeypotRef} tabIndex={-1} autoComplete="off" />
      </div>

      {/* Submit + reply line pass: below lg, stacked (button then reply
          line, both left-aligned) — the same visual result the previous
          pass already settled, just now sharing one wrapper instead of the
          reply line living outside the form entirely (ContactBlock.tsx no
          longer renders it). At lg+, row-reverse puts the reply line on
          the left (growing) and the button on the right (intrinsic,
          right-aligned) — DOM order (button, then reply line) is
          unchanged either way; row-reverse only flips visual position, and
          the reply line isn't focusable, so there's no tab-order
          consequence from the flip (same reasoning as the photo column). */}
      <div className={styles.submitRow}>
        <Button
          type="submit"
          variant="primary"
          tone="mid"
          className={styles.submitButton}
          pending={status === "submitting"}
        >
          {status === "submitting" ? t.submitLabelBusy : t.submitLabel}
        </Button>
        <p className={styles.replyLine}>{replyLine}</p>
      </div>
    </form>
  );
}
