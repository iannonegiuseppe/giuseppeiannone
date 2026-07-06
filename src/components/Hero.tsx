import { getTranslations } from "next-intl/server";
import type { Image as SanityImage } from "sanity";
import { ButtonLink } from "@/components/Button";
import { HeroMedia } from "@/components/HeroMedia";
import { imageDimensions, urlFor } from "@/sanity/image";
import { contactPath, type Locale } from "@/sanity/paths";
import styles from "./Hero.module.scss";

export interface HeroPhoto extends SanityImage {
  alt?: string;
}

export async function Hero({
  locale,
  authorName,
  credentials,
  registrationNumber,
  // Optional even though the schema requires it (same reasoning as
  // crisisSupportText, Step 4): the live homePage documents predate this
  // field. Degrades gracefully — the rest of the hero still renders.
  positioningStatement,
  photo,
  videoUrl,
}: {
  locale: Locale;
  authorName: string;
  credentials?: string;
  registrationNumber?: string;
  positioningStatement?: string;
  photo?: HeroPhoto;
  videoUrl?: string;
}) {
  const t = await getTranslations({ locale, namespace: "Hero" });
  const dims = photo ? imageDimensions(photo) : null;

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.name}>{authorName}</h1>
        {credentials ? (
          <p className={styles.credentials}>{credentials}</p>
        ) : null}
        {positioningStatement ? (
          <p className={styles.positioning}>{positioningStatement}</p>
        ) : null}
        <ButtonLink
          href={contactPath(locale)}
          variant="solid"
          className={styles.cta}
        >
          {t("cta")}
        </ButtonLink>
        {registrationNumber ? (
          <p className={styles.trustLine}>
            {t("registrationPrefix")} {registrationNumber}
          </p>
        ) : null}
      </div>
      <div className={styles.photoWrap}>
        {photo?.asset && dims ? (
          <HeroMedia
            photoSrc={urlFor(photo).width(700).url()}
            photoAlt={photo.alt ?? ""}
            photoWidth={dims.width}
            photoHeight={dims.height}
            videoSrc={videoUrl}
          />
        ) : (
          <div className={styles.photoPlaceholder} aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
