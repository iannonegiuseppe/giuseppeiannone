"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/Button";
import { ContactFormInput, ContactFormTextarea } from "./ContactFormField";
import type { ContactFieldHandle } from "./ContactFormField";
import { privacyPath, type Locale } from "@/sanity/paths";
import {
  validateContactForm,
  validateEmail,
  validateNome,
  validateTelefono,
  type ContactChannel,
  type ContactFormErrors,
  type ContactFormValues,
} from "@/lib/contact/validation";
import { contactErrorMessage } from "@/lib/contact/errorMessages";
import { useFormToken } from "@/lib/contact/useFormToken";
import styles from "./ContactForm.module.scss";

// Merge pass — the polymorphic `contact` field (phone-or-email keyed by
// channel) that used to cause a 400 on every whatsapp/telefonata submission
// is gone; telefono is a real, transmitted field now (the old "TODO(contact-
// wiring): telefono is LOCAL STATE ONLY" is resolved). Validation runs
// through validateContactForm (src/lib/contact/validation.ts) — the SAME
// function api/contact/route.ts calls, not a separate client dispatch —
// so client and server can no longer disagree about what's valid. Error
// PROSE comes from src/lib/contact/errorMessages.ts, the one place
// bilingual copy lives; validators themselves only ever return codes.
//
// Rename pass: this is the ONE contact form now, embedded (via
// ContactBlock) and modal (via ContactFormDialog). The old, separately-
// forked plain ContactForm.tsx/ContactFormField.tsx (single polymorphic
// "contact" field, Italian-only dialog heading) are retired — this file
// took over their names; it was ContactFormLab.tsx until this pass.
type SubmitStatus = "idle" | "submitting" | "success" | "error";

const DEFAULT_CHANNEL: ContactChannel = "whatsapp";
const WHATSAPP_FALLBACK_DISPLAY = "+39 339 190 1474";

const COPY = {
  it: {
    fieldLabels: {
      nome: "Nome",
      // Reactive: telefono is genuinely required once whatsapp/telefonata
      // is selected — a static "(facoltativo)" label would tell a visitor
      // the opposite of what validateTelefono actually enforces.
      telefonoRequired: "Numero di telefono",
      telefonoOptional: "Numero (facoltativo)",
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
    channelPhrases: { whatsapp: "su WhatsApp", telefonata: "al telefono", email: "via email" } as Record<
      ContactChannel,
      string
    >,
    successMessage: (nome: string, channelPhrase: string) =>
      `Grazie, ${nome}. Ti ricontatto io ${channelPhrase} — di solito entro 24 ore.`,
    genericError: `Qualcosa non ha funzionato. Puoi scrivermi direttamente su WhatsApp: ${WHATSAPP_FALLBACK_DISPLAY}`,
    honeypotLabel: "Non compilare questo campo",
  },
  en: {
    fieldLabels: {
      nome: "Name",
      telefonoRequired: "Phone number",
      telefonoOptional: "Phone (optional)",
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
    channelPhrases: { whatsapp: "on WhatsApp", telefonata: "by phone", email: "by email" } as Record<
      ContactChannel,
      string
    >,
    successMessage: (nome: string, channelPhrase: string) =>
      `Thanks, ${nome}. I'll get back to you ${channelPhrase} — usually within 24 hours.`,
    genericError: `Something didn't work. You can write to me directly on WhatsApp: ${WHATSAPP_FALLBACK_DISPLAY}`,
    honeypotLabel: "Don't fill in this field",
  },
};

export function ContactForm({ locale, replyLine }: { locale: Locale; replyLine: string }) {
  const t = COPY[locale];

  const [channel, setChannel] = useState<ContactChannel | null>(DEFAULT_CHANNEL);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submittedNome, setSubmittedNome] = useState("");
  const [submittedChannel, setSubmittedChannel] = useState<ContactChannel | null>(null);
  const { getToken, refreshToken } = useFormToken();

  const nomeRef = useRef<ContactFieldHandle>(null);
  const telefonoRef = useRef<ContactFieldHandle>(null);
  const emailRef = useRef<ContactFieldHandle>(null);
  const messaggioRef = useRef<ContactFieldHandle>(null);
  const firstChannelRadioRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const channelGroupId = useId();
  const honeypotId = useId();

  function focusFirstError(fieldErrors: ContactFormErrors) {
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
    // Switching channels can change whether telefono is required (e.g.
    // moving from email to whatsapp) — clear any stale telefono error
    // from before the switch, same as it already clears channel's own.
    setErrors((prev) => ({ ...prev, channel: undefined, telefono: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nome = nomeRef.current?.getValue() ?? "";
    const telefono = telefonoRef.current?.getValue() ?? "";
    const email = emailRef.current?.getValue() ?? "";
    const messaggio = messaggioRef.current?.getValue() ?? "";
    const consent = consentRef.current?.checked ?? false;
    const honeypot = honeypotRef.current?.value ?? "";

    const values: ContactFormValues = { nome, channel, email, telefono, messaggio, consent };
    const validationErrors = validateContactForm(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      focusFirstError(validationErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    async function submitOnce(formToken: string) {
      return fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          channel,
          email: email.trim(),
          telefono: telefono.trim(),
          messaggio: messaggio.trim(),
          consent,
          companyWebsite: honeypot,
          formToken,
          locale,
        }),
      });
    }

    try {
      let res = await submitOnce(await getToken());

      // A token that expired while the visitor was still filling the form
      // must not cost them their message (see formToken.ts's own
      // lifetime comment) — one silent retry with a freshly-issued token,
      // resubmitting the exact same values already sitting in the form.
      if (res.status === 401) {
        const expired: { code?: string } | null = await res.json().catch(() => null);
        if (expired?.code === "token-expired") {
          res = await submitOnce(await refreshToken());
        }
      }

      if (res.ok) {
        setSubmittedNome(nome.trim());
        setSubmittedChannel(channel);
        setStatus("success");
        return;
      }

      // A 400 here means the server's own validateContactForm rejected
      // something — same rules the client already checked above, so this
      // path is a defence against a stale/bypassed client, not evidence of
      // a client/server disagreement (there is only one rule set now).
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
    return (
      <p className={styles.successMessage}>
        {t.successMessage(submittedNome, t.channelPhrases[submittedChannel])}
      </p>
    );
  }

  const telefonoRequired = channel === "whatsapp" || channel === "telefonata";
  const telefonoLabel = telefonoRequired ? t.fieldLabels.telefonoRequired : t.fieldLabels.telefonoOptional;

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
      {status === "error" ? (
        <div className={styles.formBanner} role="alert">
          <p className={styles.formBannerText}>{t.genericError}</p>
        </div>
      ) : null}

      {/* Row 1: Nome | Numero — equal width at sm+. */}
      <div className={styles.fieldRow}>
        <ContactFormInput
          label={t.fieldLabels.nome}
          name="nome"
          required
          ref={nomeRef}
          error={errors.nome ? contactErrorMessage(locale, "nome", errors.nome) : undefined}
          onBlurValue={(value) => {
            // Untouched (never typed into) must not error on blur — only a
            // non-empty value gets validated here. Submit's own check is
            // what still catches an empty required field on attempted submit.
            if (!value.trim()) {
              setErrors((prev) => ({ ...prev, nome: undefined }));
              return;
            }
            setErrors((prev) => ({ ...prev, nome: validateNome(value) }));
          }}
          onChangeValue={(value) => {
            // Clears the moment the field becomes valid, no second blur
            // needed — only acts while an error is already showing.
            if (errors.nome && !validateNome(value)) {
              setErrors((prev) => ({ ...prev, nome: undefined }));
            }
          }}
        />
        <ContactFormInput
          label={telefonoLabel}
          name="telefono"
          required={telefonoRequired}
          ref={telefonoRef}
          error={errors.telefono ? contactErrorMessage(locale, "telefono", errors.telefono) : undefined}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          onBlurValue={(value) => {
            // An empty field never errors on blur, even when telefono is
            // required for the selected channel — "required" is enforced
            // at submit time only, same treatment as every other field.
            if (!value.trim()) {
              setErrors((prev) => ({ ...prev, telefono: undefined }));
              return;
            }
            setErrors((prev) => ({ ...prev, telefono: validateTelefono(channel, value) }));
          }}
          onChangeValue={(value) => {
            if (errors.telefono && (!value.trim() || !validateTelefono(channel, value))) {
              setErrors((prev) => ({ ...prev, telefono: undefined }));
            }
          }}
        />
      </div>

      {/* Screen-reader-only announcement of the telefono field's label —
          the visible label above already changes with it (required vs
          optional wording), but a label's text/attribute changes are only
          read on focus, not proactively. A visitor who picks a different
          channel without refocusing telefono would otherwise get a purely
          visual update. aria-live announces it regardless of focus;
          aria-atomic ensures the whole sentence is re-read, not a diff.
          Reuses the same (already-approved) label text — no separate copy. */}
      <p aria-live="polite" aria-atomic="true" className={styles.srOnlyStatus}>
        {telefonoLabel}
      </p>

      {/* Row 2: Email, full width — always required regardless of channel. */}
      <ContactFormInput
        label={t.fieldLabels.email}
        name="email"
        required
        ref={emailRef}
        error={errors.email ? contactErrorMessage(locale, "email", errors.email) : undefined}
        type="email"
        inputMode="email"
        autoComplete="email"
        onBlurValue={(value) => {
          if (!value.trim()) {
            setErrors((prev) => ({ ...prev, email: undefined }));
            return;
          }
          setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        }}
        onChangeValue={(value) => {
          if (errors.email && !validateEmail(value)) {
            setErrors((prev) => ({ ...prev, email: undefined }));
          }
        }}
      />

      {/* Row 3: message, full width. */}
      <ContactFormTextarea label={t.fieldLabels.messaggio} name="messaggio" ref={messaggioRef} />

      <fieldset
        className={styles.pillFieldset}
        aria-describedby={errors.channel ? `${channelGroupId}-error` : undefined}
      >
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
            {contactErrorMessage(locale, "channel", errors.channel)}
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
            {contactErrorMessage(locale, "consent", errors.consent)}
          </p>
        ) : null}
      </div>

      {/* Hardening pass — Alex's real Android Chrome submission got caught
          by this exact field: name="companyWebsite" reads to Chrome's
          Autofill (not a bot, a browser feature) as a plausible
          organization/URL field, and it filled it despite the CSS/aria
          hiding — autofill matches on name/id/autocomplete, not on
          whether the field is visible. Renamed to something with zero
          dictionary overlap with any known autofill category (no "name",
          "email", "company", "url", "website", "phone", "address" — the
          terms autofill heuristics actually key off), which is the fix;
          autoComplete="off" stays as a second, weaker layer (browsers are
          known to override it for fields they're confident about, which
          is exactly what happened here) — tabIndex/aria-hidden/off-screen
          positioning are unchanged, they were never the problem. */}
      <div className={styles.honeypotWrap} aria-hidden="true">
        <label htmlFor={honeypotId}>{t.honeypotLabel}</label>
        <input id={honeypotId} type="text" name="hp_x7k2" ref={honeypotRef} tabIndex={-1} autoComplete="off" />
      </div>

      {/* Submit + reply line: below lg, stacked (button then reply line,
          both left-aligned). At lg+, row-reverse puts the reply line on
          the left (growing) and the button on the right (intrinsic,
          right-aligned) — DOM order (button, then reply line) is
          unchanged either way; row-reverse only flips visual position. */}
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
