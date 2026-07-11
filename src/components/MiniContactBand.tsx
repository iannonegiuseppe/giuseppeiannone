import type { ContactChannel } from "@/sanity/seo";
import { whatsappUrl } from "@/sanity/contact";
import styles from "./MiniContactBand.module.scss";
import sharedStyles from "./sharedSections.module.scss";

// NEW section, block 10 (right after Ti riconosci?, before Sedi) — a
// low-threshold contact option for the person who cannot yet formulate a
// request. NOT the main CTA (FinalContactSection, block 14) — deliberately
// quiet and practical: one button (WhatsApp), everything else is a plain
// text link, per spec's "exactly ONE button in the band" rule.
//
// CMS-wiring pass: contactChannels is now a prop (siteSettings-driven,
// the SAME array the header's ChannelPickerDialog.tsx popup consumes) —
// replaces the static src/components/contactChannels.ts import both this
// component and the popup used to read directly.
function channelHref(channel: ContactChannel): string {
  if (channel.type === "whatsapp") return whatsappUrl(channel.value);
  if (channel.type === "phone") return `tel:${channel.value}`;
  return `mailto:${channel.value}`;
}

export function MiniContactBand({
  kicker,
  heading,
  body,
  contactChannels,
}: {
  kicker: string;
  heading: string;
  body: string;
  contactChannels?: ContactChannel[];
}) {
  return (
    <section className={styles.miniContactBand} data-lab-section="mini-contact">
      <div className={styles.miniContactGrid}>
        <div className={styles.miniContactLeft}>
          <p className={styles.miniContactKicker}>
            <span className={styles.miniContactKickerRule} aria-hidden="true" />
            {kicker}
          </p>
          <h2 className={styles.miniContactHeading}>{heading}</h2>
          <p className={styles.miniContactBody}>{body}</p>
        </div>
        <div className={styles.miniContactRight}>
          {contactChannels
            ?.slice()
            .sort((a, b) => a.order - b.order)
            .map((channel) =>
              channel.type === "whatsapp" ? (
                <a
                  key={channel.type}
                  href={channelHref(channel)}
                  className={`${sharedStyles.btnSecondary} ${styles.miniContactWhatsapp}`}
                >
                  {channel.label}
                </a>
              ) : (
                <a key={channel.type} href={channelHref(channel)} className={styles.miniContactLink}>
                  {channel.label}
                </a>
              ),
            )}
        </div>
      </div>
    </section>
  );
}
