"use client";

import { useEffect, useRef } from "react";
import NextImage from "next/image";
import styles from "./lightbox.module.scss";

export function Lightbox({
  imageUrl,
  imageAlt,
  caption,
  onClose,
}: {
  imageUrl: string;
  imageAlt: string;
  caption?: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={imageAlt}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.closeButton}
          aria-label="Chiudi"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M6 6 L18 18 M18 6 L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className={styles.frame}>
          <NextImage src={imageUrl} alt={imageAlt} fill sizes="56rem" className={styles.img} />
        </div>
        {caption ? <p className={styles.caption}>{caption}</p> : null}
      </div>
    </div>
  );
}
