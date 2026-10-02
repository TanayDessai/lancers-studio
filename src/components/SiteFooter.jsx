import styles from './SiteFooter.module.css';

export default function SiteFooter({ content, brand }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.band}>
        <img
          className={styles.photo}
          src={content.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
        <div className={styles.scrim} />
        <div className={styles.wordmarkClip}>
          <div className={styles.wordmark}>{content.ghostWordmark}</div>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.block}>
          <img className={styles.mark} src="/assets/mark-white.svg" alt={brand.fullName} />
          <div className={styles.brandName}>{brand.fullName}</div>
          <div className={styles.strapline}>{brand.strapline}</div>
        </div>

        <div className={styles.block}>
          <div className={styles.blockLabel}>{content.contactLabel}</div>
          <div className={styles.value}>{brand.proprietor}</div>
          <div className={styles.links}>
            {content.social.map((link) => (
              <a key={link.label} className={styles.link} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <div className={styles.blockLabel}>Registered address</div>
          <address className={styles.address}>
            {brand.address.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </address>
        </div>
      </div>

      <div className={styles.legal}>
        <span>{brand.legal}</span>
        <span>{brand.website}</span>
      </div>
    </footer>
  );
}
