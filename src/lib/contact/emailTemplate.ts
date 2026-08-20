import { getSiteUrl } from "@/sanity/metadata";
import type { EmailFooterData } from "./emailFooterData";

// HTML email pass — table layout, inline styles only. Techniques
// deliberately avoided and why (Outlook for Windows renders email HTML
// through Word's own engine, not a browser engine — this is the actual
// constraint, not a vague "email is old" excuse):
//   - Flexbox / CSS Grid: no Word-engine support at all. Every layout
//     decision here is a <table> instead.
//   - CSS custom properties (var(--x)): unsupported in Word's engine and
//     inconsistently supported elsewhere (some webmail proxies strip
//     <style> custom-property declarations entirely) — every color/size
//     below is a literal, repeated inline value, not a token reference.
//   - gap: flex/grid-only, meaningless outside them regardless.
//   - Modern selectors (:has, :is, nesting): no email client parses
//     these reliably; every rule here is either inline or a single flat
//     class in the one <style> block (used only for the responsive width
//     tweak — see EMAIL_STYLE below).
//   - box-shadow / border-radius: used nowhere load-bearing — the
//     practical block's background is a plain rectangle, not a rounded
//     card, specifically so it still reads correctly in clients that
//     ignore border-radius rather than rendering a slightly-wrong shape.
//   - Web fonts (@font-face / EB Garamond): won't load in the vast
//     majority of email clients (blocked or simply unsupported) — see
//     the two font stacks below, both system/near-universal fonts.
// role="presentation" on every layout <table> — screen readers should
// skip these as layout, not announce them as data tables.

const HEADING_FONT = "Georgia, 'Times New Roman', Times, serif";
const BODY_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const COLOR_BG = "#F6F3EE"; // ivory ground
const COLOR_HEADER = "#081512"; // dark green header band
const COLOR_ACCENT = "#C29A5E"; // champagne — rule + emphasis words
const COLOR_INK = "#2E2B28"; // dark ink body text
const COLOR_MUTED = "#6B655A";
const COLOR_PRACTICAL_BG = "#EFEAE0";
const COLOR_FOOTER_BG = "#EFEAE0";

// The CID this file's <img src="cid:..."> and sender.ts's attachment
// definition must agree on — one constant, not a string repeated in two
// files that could drift apart.
export const LOGO_CID = "practice-logo";

// Reused from src/sanity/metadata.ts rather than a new constant — this
// IS already "one place, one edit" for the site's own absolute origin
// sitewide (canonicals, hreflang, sitemap, JSON-LD), so a second,
// email-only version would just be a second thing to keep in sync.
// Today (site not yet live on its real domain): NEXT_PUBLIC_SITE_URL is
// unset, so this resolves through getSiteUrl()'s own fallback chain to
// the current Vercel deployment's own URL (correct — an email sent from
// a preview should link back to that same preview, not a domain that
// doesn't serve this content yet). At launch, setting
// NEXT_PUBLIC_SITE_URL=https://giuseppeiannone.it in Vercel's project
// settings is the entire change — nothing here or in sender.ts moves.
function siteUrl(): string {
  return getSiteUrl();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Copy (and only copy — never a user-submitted value) may wrap a word or
// phrase in {{double braces}} to mark it as a champagne emphasis word.
// Applied AFTER escaping the whole string, so any user-submitted value
// interpolated into a content string (payload.nome, etc.) is safely
// escaped first and can never itself inject a {{}} marker or any other
// markup — {{}} only ever comes from copy this codebase itself wrote.
function renderInlineHtml(text: string): string {
  return escapeHtml(text).replace(
    /\{\{(.+?)\}\}/g,
    (_match, inner: string) => `<span style="color:${COLOR_ACCENT};">${inner}</span>`,
  );
}

function renderInlineText(text: string): string {
  return text.replace(/\{\{(.+?)\}\}/g, "$1");
}

// Download-flow copy pass — a practical-block line is normally plain
// text, but the libri confirmation's download link needs to be an actual
// clickable <a>, not a raw URL sitting in running text. { label, href }
// is the one exception to "every practical-block line is plain copy" —
// href is never copy (it's a real URL, escaped as an attribute, not
// passed through the {{...}} emphasis pipeline the way label is).
export type EmailPracticalLine = string | { label: string; href: string };

export interface EmailPracticalBlock {
  heading?: string;
  lines: EmailPracticalLine[];
}

// The content model both renderers below read — heading/openingLine/
// bodyParagraphs/practicalBlock map directly to the copy slots this
// pass's own report asks the owner to write against. Every string here
// may use {{...}} for a champagne emphasis word; every string here is
// escaped before it reaches the HTML output, so building these strings
// with a raw ${payload.nome} interpolation is safe.
export interface EmailContent {
  heading: string;
  openingLine?: string;
  bodyParagraphs?: string[];
  practicalBlock?: EmailPracticalBlock;
}

export interface EmailFooterLines {
  // Placeholder for now (see this pass's own report on why) — a
  // dedicated line, not wired to the sede/locationPage content model.
  locationsLine: string;
}

function renderParagraphHtml(text: string): string {
  return `<p style="margin:0 0 16px 0;font-family:${BODY_FONT};font-size:16px;line-height:1.6;color:${COLOR_INK};">${renderInlineHtml(text)}</p>`;
}

function renderPracticalBlockHtml(block: EmailPracticalBlock): string {
  const heading = block.heading
    ? `<p style="margin:0 0 12px 0;font-family:${BODY_FONT};font-size:14px;font-weight:bold;color:${COLOR_INK};">${renderInlineHtml(block.heading)}</p>`
    : "";
  const lines = block.lines
    .map((line) => {
      const inner =
        typeof line === "string"
          ? renderInlineHtml(line)
          : `<a href="${escapeHtml(line.href)}" style="color:${COLOR_ACCENT};text-decoration:underline;">${renderInlineHtml(line.label)}</a>`;
      return `<p style="margin:0 0 8px 0;font-family:${BODY_FONT};font-size:15px;line-height:1.5;color:${COLOR_INK};">${inner}</p>`;
    })
    .join("\n");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;background-color:${COLOR_PRACTICAL_BG};">
      <tr>
        <td style="padding:20px 24px;">
          ${heading}
          ${lines}
        </td>
      </tr>
    </table>
  `;
}

// Minimal, standard "fluid hybrid" responsive block — the ONLY <style>
// in the document, and everything in it is a fallback/enhancement, never
// load-bearing: the table-based structure below is already single-column
// with nothing to collapse FROM (there is no side-by-side content
// anywhere in this design), so a client that ignores this block entirely
// (Outlook for Windows) still renders correctly, just at the fixed 600px
// width rather than fluid. Clients that DO read it (Apple Mail, Gmail,
// most mobile mail apps) get the table stretched to the phone's own
// width with lighter padding instead of a fixed 600px canvas the visitor
// would otherwise have to pinch-zoom.
const EMAIL_STYLE = `
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-body-cell { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
`;

export function renderEmailHtml(
  content: EmailContent,
  footer: EmailFooterLines,
  footerData: EmailFooterData,
  locale: "it" | "en",
): string {
  const whatsappUrl = "https://wa.me/393391901474";
  const instagramUrl = footerData.instagramUrl;
  const albo =
    locale === "en"
      ? `Registered Psychologist — Ordine degli Psicologi della Lombardia${footerData.registrationNumber ? `, no. ${escapeHtml(footerData.registrationNumber)}` : ""}`
      : `Psicologo iscritto all'Albo degli Psicologi della Lombardia${footerData.registrationNumber ? `, n. ${escapeHtml(footerData.registrationNumber)}` : ""}`;

  const openingLineHtml = content.openingLine
    ? `<p style="margin:0 0 20px 0;font-family:${BODY_FONT};font-size:17px;line-height:1.6;color:${COLOR_INK};">${renderInlineHtml(content.openingLine)}</p>`
    : "";
  const bodyParagraphsHtml = (content.bodyParagraphs ?? []).map(renderParagraphHtml).join("\n");
  const practicalHtml = content.practicalBlock ? renderPracticalBlockHtml(content.practicalBlock) : "";

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${renderInlineText(content.heading)}</title>
${EMAIL_STYLE}
</head>
<body style="margin:0;padding:0;background-color:${COLOR_BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLOR_BG};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${COLOR_BG};">
          <tr>
            <td bgcolor="${COLOR_HEADER}" style="background-color:${COLOR_HEADER};padding:28px 24px;text-align:center;">
              <a href="${siteUrl()}" style="text-decoration:none;">
                <img src="cid:${LOGO_CID}" width="220" height="37" alt="Dr. Giuseppe Iannone — Psicoterapeuta" style="display:block;margin:0 auto;border:0;outline:none;max-width:220px;height:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td bgcolor="${COLOR_ACCENT}" style="background-color:${COLOR_ACCENT};height:3px;line-height:3px;font-size:0;">&nbsp;</td>
          </tr>
          <tr>
            <td class="email-body-cell" style="padding:40px 32px;background-color:${COLOR_BG};">
              <h1 style="margin:0 0 18px 0;font-family:${HEADING_FONT};font-size:26px;line-height:1.3;color:${COLOR_HEADER};font-weight:normal;">${renderInlineHtml(content.heading)}</h1>
              ${openingLineHtml}
              ${bodyParagraphsHtml}
              ${practicalHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color:${COLOR_FOOTER_BG};padding:28px 32px;text-align:center;">
              <p style="margin:0 0 10px 0;font-family:${BODY_FONT};font-size:13px;line-height:1.5;color:${COLOR_MUTED};">${renderInlineHtml(footer.locationsLine)}</p>
              <p style="margin:0 0 10px 0;font-family:${BODY_FONT};font-size:13px;">
                <a href="${whatsappUrl}" style="color:${COLOR_ACCENT};text-decoration:underline;">WhatsApp</a>
                <span style="color:${COLOR_MUTED};">&nbsp;&middot;&nbsp;</span>
                ${
                  instagramUrl
                    ? `<a href="${escapeHtml(instagramUrl)}" style="color:${COLOR_ACCENT};text-decoration:underline;">Instagram</a>`
                    : `<span style="color:${COLOR_MUTED};">Instagram</span>`
                }
              </p>
              <p style="margin:0;font-family:${BODY_FONT};font-size:12px;line-height:1.5;color:${COLOR_MUTED};">${albo}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderEmailText(
  content: EmailContent,
  footer: EmailFooterLines,
  footerData: EmailFooterData,
  locale: "it" | "en",
): string {
  const lines: string[] = [];
  lines.push(renderInlineText(content.heading));
  lines.push("");
  if (content.openingLine) {
    lines.push(renderInlineText(content.openingLine));
    lines.push("");
  }
  for (const p of content.bodyParagraphs ?? []) {
    lines.push(renderInlineText(p));
    lines.push("");
  }
  if (content.practicalBlock) {
    if (content.practicalBlock.heading) {
      lines.push(renderInlineText(content.practicalBlock.heading));
    }
    for (const line of content.practicalBlock.lines) {
      lines.push(typeof line === "string" ? renderInlineText(line) : `${renderInlineText(line.label)}: ${line.href}`);
    }
    lines.push("");
  }
  lines.push("----------------------------------------");
  lines.push(renderInlineText(footer.locationsLine));
  lines.push(`WhatsApp: https://wa.me/393391901474`);
  if (footerData.instagramUrl) {
    lines.push(`Instagram: ${footerData.instagramUrl}`);
  }
  const albo =
    locale === "en"
      ? `Registered Psychologist — Ordine degli Psicologi della Lombardia${footerData.registrationNumber ? `, no. ${footerData.registrationNumber}` : ""}`
      : `Psicologo iscritto all'Albo degli Psicologi della Lombardia${footerData.registrationNumber ? `, n. ${footerData.registrationNumber}` : ""}`;
  lines.push(albo);

  return lines.join("\n");
}
