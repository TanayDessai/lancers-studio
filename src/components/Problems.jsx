import Reveal from './Reveal.jsx';
import styles from './Problems.module.css';

export default function Problems({ content }) {
  return (
    <section id="problems" className={styles.section}>
      <img
        className={styles.photo}
        src={content.image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
      <div className={styles.scrim} />

      <div className={styles.inner}>
        <Reveal variant="rise" duration={1.2} className={styles.header}>
          <div className="eyebrow eyebrowOnDark">{content.eyebrow}</div>
          <h2 className={styles.headline}>{content.headline}</h2>
          <p className={styles.body}>{content.body}</p>
        </Reveal>

        <div className={styles.grid}>
          {content.items.map((item, i) => (
            <Reveal
              key={item.code}
              variant="fade"
              duration={1}
              amount={0.2}
              delay={Math.min(i, 5) * 0.05}
              className={styles.card}
            >
              <span className={styles.code}>{item.code}</span>
              <span className={styles.label}>{item.label}</span>
            </Reveal>
          ))}

          <Reveal variant="fade" duration={1} amount={0.2} className={styles.callout}>
            <a href={content.callout.href} className={styles.calloutLink}>
              <span className={styles.calloutLabel}>{content.callout.label}</span>
              <span className={styles.calloutText}>{content.callout.text}</span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
