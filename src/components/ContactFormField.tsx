"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, RefObject } from "react";
import styles from "./ContactForm.module.scss";

// Exposed to ContactForm.tsx instead of the raw DOM node — mutating a
// ref/prop received from an ancestor directly (the merged-callback-ref
// pattern) trips this project's react-hooks/immutability lint rule;
// useImperativeHandle is the sanctioned way to hand a parent a stable,
// narrow handle onto a child's internals. getValue() re-reads the live
// DOM value on each call rather than a captured snapshot, so it's always
// current at submit time (fields are otherwise uncontrolled).
export interface ContactFieldHandle {
  focus: () => void;
  getValue: () => string;
}

interface FieldBaseProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  name: string;
  defaultValue?: string;
  onBlurValue?: (value: string) => void;
  onChangeValue?: (value: string) => void;
}

// Floating-label "has value" state needs to react to real typing (input
// event), a defaultValue already present on mount (e.g. browser session
// restore), and — the tricky one — browser autofill, which doesn't
// reliably fire input/change in every engine. The standard workaround:
// an autofill-only CSS animation (.ffAutofillDetector, see
// ContactForm.module.scss) that starts the instant the browser paints
// the autofilled state, independent of whether it also dispatches
// input/change. Verified against Chrome's autofill emulation — see this
// pass's own QA report for what was actually observed.
function useHasValue(ref: RefObject<HTMLInputElement | HTMLTextAreaElement | null>) {
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const sync = () => setHasValue(el.value.trim().length > 0);
    sync();

    function onAnimationStart(event: AnimationEvent) {
      if (event.animationName === styles.ffAutofillDetector) {
        setHasValue(true);
      }
    }

    el.addEventListener("input", sync);
    el.addEventListener("change", sync);
    el.addEventListener("animationstart", onAnimationStart as EventListener);
    return () => {
      el.removeEventListener("input", sync);
      el.removeEventListener("change", sync);
      el.removeEventListener("animationstart", onAnimationStart as EventListener);
    };
  }, [ref]);

  return hasValue;
}

function fieldDescribedBy(hintId: string | undefined, errorId: string | undefined): string | undefined {
  return [errorId, hintId].filter(Boolean).join(" ") || undefined;
}

interface ContactFormInputProps extends FieldBaseProps {
  type?: "text" | "email" | "tel";
  inputMode?: "text" | "tel" | "email";
  autoComplete?: string;
}

// Real <label htmlFor> (a11y) positioned over the input at rest — not a
// styled placeholder. data-floated switches between the "placeholder
// position" rest state and the risen/scaled state on focus or non-empty
// value; ContactForm.module.scss reserves the space for both states
// permanently (asymmetric padding-top on the input itself), so floating
// never shifts layout.
export const ContactFormInput = forwardRef<ContactFieldHandle, ContactFormInputProps>(
  function ContactFormInput(
    { label, hint, error, required, name, defaultValue, onBlurValue, onChangeValue, type = "text", inputMode, autoComplete },
    handleRef,
  ) {
    const innerRef = useRef<HTMLInputElement>(null);
    const hasValue = useHasValue(innerRef);
    const [focused, setFocused] = useState(false);
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint ? `${id}-hint` : undefined;

    useImperativeHandle(handleRef, () => ({
      focus: () => innerRef.current?.focus(),
      getValue: () => innerRef.current?.value ?? "",
    }));

    return (
      <div className={styles.ffWrap}>
        <input
          ref={innerRef}
          id={id}
          name={name}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          required={required}
          defaultValue={defaultValue}
          className={styles.ffInput}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(hintId, errorId)}
          onFocus={() => setFocused(true)}
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            setFocused(false);
            onBlurValue?.(event.target.value);
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChangeValue?.(event.target.value)}
        />
        <label htmlFor={id} className={styles.ffLabel} data-floated={focused || hasValue}>
          {label}
        </label>
        {hint ? (
          <p id={hintId} className={styles.ffHint}>
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className={styles.ffError} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

interface ContactFormTextareaProps extends FieldBaseProps {
  rows?: number;
}

export const ContactFormTextarea = forwardRef<ContactFieldHandle, ContactFormTextareaProps>(
  function ContactFormTextarea(
    // rows=2 (was 4) — compact pass; CSS min-height (~76px, ContactForm.module.scss)
    // is what actually governs the visual size, this just matches the
    // intrinsic HTML sizing hint to it.
    { label, hint, error, required, name, defaultValue, onBlurValue, onChangeValue, rows = 2 },
    handleRef,
  ) {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const hasValue = useHasValue(innerRef);
    const [focused, setFocused] = useState(false);
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint ? `${id}-hint` : undefined;

    useImperativeHandle(handleRef, () => ({
      focus: () => innerRef.current?.focus(),
      getValue: () => innerRef.current?.value ?? "",
    }));

    return (
      <div className={styles.ffWrap}>
        <textarea
          ref={innerRef}
          id={id}
          name={name}
          rows={rows}
          required={required}
          defaultValue={defaultValue}
          className={styles.ffTextarea}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(hintId, errorId)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            onBlurValue?.(event.target.value);
          }}
          onChange={(event) => onChangeValue?.(event.target.value)}
        />
        <label htmlFor={id} className={styles.ffLabel} data-floated={focused || hasValue}>
          {label}
        </label>
        {hint ? (
          <p id={hintId} className={styles.ffHint}>
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className={styles.ffError} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
