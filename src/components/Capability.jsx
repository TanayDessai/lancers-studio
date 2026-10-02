import Reveal from './Reveal.jsx';
import styles from './Capability.module.css';

/**
 * Replaces named project credits. The company profile shows building types
 * rather than projects because "project names, locations and scopes are shown
 * only with client permission" — so this section carries no photography and no
 * client names either.
 */
export default function Capability({ content }) {
  return (
    <section id="capability" className={styles.section}>
      <Reveal variant="rise" duration={1.2} className={styles.header}>
        <div className={styles.headerInner}>
          <div className="eyebrow">{content.eyebrow}</div>
          <h2 className={`h2Section ${styles.headline}`}>{content.headline}</h2>
          <p className={styles.body}>{content.body}</p>
        </div>
      </Reveal>

      <Reveal
        variant="fade"
        duration={1.4}
        amount={0.12}
        className={`noScrollbar ${styles.gallery}`}
      >
        {content.items.map((item) => (
          <article key={item.code} className={styles.card}>
            <span className={styles.code}>{item.code}</span>
            <span className={styles.label}>{item.label}</span>
          </article>
        ))}

        <article className={`${styles.card} ${styles.note}`}>
          <span className={styles.noteLabel}>{content.note.label}</span>
          <span className={styles.label}>{content.note.value}</span>
        </article>
      </Reveal>
    </section>
  );
}
