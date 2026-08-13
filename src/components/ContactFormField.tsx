"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, RefObject } from "react";
import styles from "./ContactForm.module.scss";

// Floating-label input/textarea primitives for ContactForm.tsx. Rename
// pass: this was ContactFormFieldLab.tsx, forked from an older, now-
// deleted ContactFormField.tsx that fed a separate, now-retired plain
// ContactForm.tsx — that fork is gone, this is the one implementation.
// data-floated is set on the input/textarea itself (not just the label)
// because ContactForm.module.scss's "filled" state needs to style the
// field's own border once it has a value, not just reposition the label.
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
    const floated = focused || hasValue;

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
          data-floated={floated}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(hintId, errorId)}
          onFocus={() => setFocused(true)}
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            setFocused(false);
            onBlurValue?.(event.target.value);
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChangeValue?.(event.target.value)}
        />
        <label htmlFor={id} className={styles.ffLabel} data-floated={floated}>
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
    { label, hint, error, required, name, defaultValue, onBlurValue, onChangeValue, rows = 2 },
    handleRef,
  ) {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const hasValue = useHasValue(innerRef);
    const [focused, setFocused] = useState(false);
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint ? `${id}-hint` : undefined;
    const floated = focused || hasValue;

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
          data-floated={floated}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(hintId, errorId)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            onBlurValue?.(event.target.value);
          }}
          onChange={(event) => onChangeValue?.(event.target.value)}
        />
        <label htmlFor={id} className={styles.ffLabel} data-floated={floated}>
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
