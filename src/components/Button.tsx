import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import styles from "./Button.module.scss";

export type ButtonVariant = "solid" | "outline";

function buttonClassName(variant: ButtonVariant, className?: string): string {
  return [styles.button, styles[variant], className].filter(Boolean).join(" ");
}

interface ButtonLinkProps
  extends Omit<ComponentPropsWithoutRef<typeof Link>, "className"> {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}

// A navigational CTA styled as a button (e.g. the hero's "Prenota un primo
// colloquio") — a real link under the hood, not a <button>, since it
// navigates rather than performs an in-page action.
export function ButtonLink({
  variant = "solid",
  className,
  children,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link className={buttonClassName(variant, className)} {...linkProps}>
      {children}
    </Link>
  );
}

interface ButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "className"> {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}

// A real <button> for in-page actions (form submit, etc.).
export function Button({
  variant = "solid",
  className,
  children,
  ...buttonProps
}: ButtonProps) {
  return (
    <button className={buttonClassName(variant, className)} {...buttonProps}>
      {children}
    </button>
  );
}
