// Footer social icons pass — see InstagramIcon.tsx's own comment for the
// shared inline-SVG/currentColor rationale.
export function LinkedinIcon() {
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
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <line x1="7.3" y1="10" x2="7.3" y2="16.5" />
      <circle cx="7.3" cy="7.4" r="1.05" fill="currentColor" stroke="none" />
      <path d="M11 16.5V10m0 2.3c0-1.3 1-2.4 2.4-2.4s2.3 1 2.3 2.6v4M11 10h0" />
    </svg>
  );
}
