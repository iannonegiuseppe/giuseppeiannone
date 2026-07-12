// Footer social icons pass: inline SVG (not <img>) so currentColor
// inherits from the wrapping <a> — see Footer.module.scss's
// .labFooterSocialLink for the rest/hover color and sizing. Purely
// decorative (aria-hidden) — the accessible name lives on the parent
// link's aria-label.
export function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="16.6" cy="7.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
