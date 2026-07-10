import { contactChannels } from "./contactChannels";
import styles from "./MiniContactBand.module.scss";
import sharedStyles from "./sharedSections.module.scss";

// NEW section, block 10 (right after Ti riconosci?, before Sedi) — a
// low-threshold contact option for the person who cannot yet formulate a
// request. NOT the main CTA (FinalContactSection, block 14) — deliberately
// quiet and practical: one button (WhatsApp), everything else is a plain
// text link, per spec's "exactly ONE button in the band" rule.
//
// Header pass refactor: the channel list (label/href for whatsapp/phone/
// email) now comes from contactChannels.ts — the SAME array the header's
// ChannelPickerDialog.tsx popup consumes — rather than three separate
// whatsappLabel/phoneLabel/emailLabel props. kicker/heading/body stay
// band-specific props (the popup has its own, different heading). Visual
// output is unchanged: same labels, same hrefs, same markup shape per
// channel, verified pixel-identical against the pre-refactor screenshot
// in this pass's QA.
export function MiniContactBand({
  kicker,
  heading,
  body,
}: {
  kicker: string;
  heading: string;
  body: string;
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
          {contactChannels.map((channel) =>
            channel.id === "whatsapp" ? (
              <a
                key={channel.id}
                href={channel.href}
                className={`${sharedStyles.btnSecondary} ${styles.miniContactWhatsapp}`}
              >
                {channel.label}
              </a>
            ) : (
              <a key={channel.id} href={channel.href} className={styles.miniContactLink}>
                {channel.label}
              </a>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
