"use client";

import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { ContactFormInput } from "@/components/ContactFormField";
import type { ContactFieldHandle } from "@/components/ContactFormField";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { validateEmail, validateNome } from "@/lib/contact/validation";
import { useFormToken } from "@/lib/contact/useFormToken";
import { privacyPath, type Locale } from "@/sanity/paths";
import styles from "./LibriForm.module.scss";

interface LibriFormCopy {
  kicker: string;
  heading: string;
  lead: string;
  consentLabel: string;
  marketingLabel: string;
  submitLabel: string;
}

interface FieldErrors {
  nome?: "required" | "invalid";
  email?: "required" | "invalid";
  consent?: "required";
}

const ERROR_TEXT: Record<Locale, { required: string; invalid: string; consentRequired: string }> = {
  it: {
    required: "Campo obbligatorio.",
    invalid: "Controlla questo campo.",
    consentRequired: "Devi accettare per procedere.",
  },
  en: {
    required: "This field is required.",
    invalid: "Please check this field.",
    consentRequired: "You need to accept to continue.",
  },
};

// Download-flow build pass — draft copy, per the owner's own instruction
// ("I will replace it"): not final wording.
const STATUS_TEXT: Record<Locale, { success: string; error: string; notReady: string }> = {
  it: {
    success: "Grazie! Il PDF si è aperto in una nuova scheda. Se non lo vedi, controlla i popup bloccati dal browser.",
    error: "Invio non riuscito. Riprova tra poco o scrivimi direttamente.",
    notReady: "Il PDF del manuale non è ancora stato caricato.",
  },
  en: {
    success: "Thank you — the PDF has opened in a new tab. If you don't see it, check your browser's pop-up blocker.",
    error: "Something went wrong. Please try again shortly or write to me directly.",
    notReady: "The guide's PDF hasn't been uploaded yet.",
  },
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

// Download-flow build pass — the form now actually submits, reusing the
// sitewide contact route/sender (POST /api/contact) rather than a second
// path: the payload adds source:"libri" (sender.ts branches on it for a
// distinct subject line + body marker, see that file's own comment) and
// marketingConsent, both optional/additive so the existing contact form
// is untouched. channel is always sent as "email" — this form collects
// no channel preference of its own, and "email" is the only true
// statement here (the PDF is always delivered by email); this satisfies
// the shared validator without changing its required-field shape.
//
// pdfUrl is null until an editor uploads the real file in Sanity — the
// submit button stays disabled (with an explanatory title) rather than
// ever sending a visitor to a URL that 404s.
export function LibriForm({
  copy,
  locale,
  pdfUrl,
}: {
  copy: LibriFormCopy;
  locale: Locale;
  pdfUrl: string | null;
}) {
  const t = ERROR_TEXT[locale];
  const st = STATUS_TEXT[locale];

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  // Two SEPARATE booleans, two separate inputs below — not one shared
  // "accept everything" toggle. Italian consent rules require marketing
  // consent to be its own explicit, optional choice, distinguishable
  // from (and never bundled with) the required privacy consent — see
  // this pass's own report for how independence is enforced structurally,
  // not just visually.
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const { getToken, refreshToken } = useFormToken();

  const nomeRef = useRef<ContactFieldHandle>(null);
  const emailRef = useRef<ContactFieldHandle>(null);
  const privacyCheckboxRef = useRef<HTMLInputElement>(null);

  const groupId = useId();

  function handleBlurNome(value: string) {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, nome: undefined }));
      return;
    }
    setErrors((prev) => ({ ...prev, nome: validateNome(value) }));
  }

  function handleChangeNome(value: string) {
    if (errors.nome && !validateNome(value)) {
      setErrors((prev) => ({ ...prev, nome: undefined }));
    }
  }

  function handleBlurEmail(value: string) {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, email: undefined }));
      return;
    }
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  }

  function handleChangeEmail(value: string) {
    if (errors.email && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nome = nomeRef.current?.getValue() ?? "";
    const email = emailRef.current?.getValue() ?? "";

    const nextErrors: FieldErrors = {
      nome: validateNome(nome),
      email: validateEmail(email),
      consent: privacyConsent ? undefined : "required",
    };
    setErrors(nextErrors);
    if (nextErrors.nome || nextErrors.email || nextErrors.consent) return;
    // Belt-and-braces — the submit button is already disabled whenever
    // pdfUrl is null, but a disabled button is a UI affordance, not a
    // guarantee; the actual send is gated here too.
    if (!pdfUrl) return;

    setStatus("submitting");

    async function submitOnce(formToken: string) {
      return fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          channel: "email",
          email: email.trim(),
          telefono: "",
          messaggio: "",
          consent: privacyConsent,
          marketingConsent,
          source: "libri",
          formToken,
          locale,
        }),
      });
    }

    try {
      let response = await submitOnce(await getToken());

      // Same "must not lose their message" retry as ContactForm.tsx — a
      // token that expired while the visitor was reading/filling this
      // form gets silently replaced and the exact same submission retried
      // once, rather than surfacing an error over something the visitor
      // did nothing wrong to cause.
      if (response.status === 401) {
        const expired: { code?: string } | null = await response.json().catch(() => null);
        if (expired?.code === "token-expired") {
          response = await submitOnce(await refreshToken());
        }
      }

      if (!response.ok) {
        setStatus("error");
        return;
      }
      // Opened alongside the confirmation, not instead of it — a popup
      // blocker silently swallowing this is exactly why the confirmation
      // text below also tells the visitor to check for one.
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.wrap}>
      <div>
        <p className={styles.kicker}>
          <SectionKicker>{copy.kicker}</SectionKicker>
        </p>
        <h2 className={styles.heading}>{copy.heading}</h2>
        <p className={styles.lead}>{copy.lead}</p>
      </div>

      {status === "success" ? (
        <p className={styles.successMessage}>{st.success}</p>
      ) : (
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldRow}>
          <ContactFormInput
            label={locale === "en" ? "Name" : "Nome"}
            name="nome"
            required
            ref={nomeRef}
            error={errors.nome ? t[errors.nome] : undefined}
            onBlurValue={handleBlurNome}
            onChangeValue={handleChangeNome}
          />
          <ContactFormInput
            label="Email"
            name="email"
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            ref={emailRef}
            error={errors.email ? t[errors.email] : undefined}
            onBlurValue={handleBlurEmail}
            onChangeValue={handleChangeEmail}
          />
        </div>

        {/* Privacy consent — required, its own independent control. */}
        <label className={styles.consentRow}>
          <input
            type="checkbox"
            name="privacyConsent"
            ref={privacyCheckboxRef}
            className={styles.consentCheckbox}
            checked={privacyConsent}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${groupId}-consent-error` : undefined}
            onChange={(event) => {
              setPrivacyConsent(event.target.checked);
              if (event.target.checked) setErrors((prev) => ({ ...prev, consent: undefined }));
            }}
          />
          <span className={styles.consentText}>
            {locale === "en" ? (
              <>
                I have read the{" "}
                <Link href={privacyPath(locale)} className={styles.consentLink}>
                  privacy notice
                </Link>{" "}
                and consent to my data being processed.
              </>
            ) : (
              copy.consentLabel
            )}
          </span>
        </label>
        {errors.consent ? (
          <p id={`${groupId}-consent-error`} className={styles.groupError} role="alert">
            {t.consentRequired}
          </p>
        ) : null}

        {/* Marketing consent — optional, a SEPARATE control from privacy
            consent above (own name, own state, own onChange) — never
            derived from or combined with it. Unchecked by default, never
            pre-checked. */}
        <label className={styles.consentRow}>
          <input
            type="checkbox"
            name="marketingConsent"
            className={styles.consentCheckbox}
            checked={marketingConsent}
            onChange={(event) => setMarketingConsent(event.target.checked)}
          />
          <span className={styles.consentText}>{copy.marketingLabel}</span>
        </label>

        {status === "error" ? (
          <div className={styles.formBanner}>
            <p className={styles.formBannerText}>{st.error}</p>
          </div>
        ) : null}

        <div className={styles.submitRow}>
          {/* Disabled only while there's genuinely nothing to submit to —
              pdfUrl is null until an editor uploads the real PDF in
              Sanity. Not a permanent state anymore (see this file's own
              top comment): once the file exists, this enables itself with
              no further code change. */}
          <Button
            type="submit"
            variant="primary"
            tone="base"
            className={styles.submitButton}
            disabled={!pdfUrl}
            pending={status === "submitting"}
            title={!pdfUrl ? st.notReady : undefined}
          >
            {copy.submitLabel}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}
