import Reveal from './Reveal.jsx';
import SystemGlyph from './SystemGlyph.jsx';
import styles from './Systems.module.css';

export default function Systems({ content }) {
  return (
    <section id="systems" className={styles.section}>
      <div className={styles.inner}>
        <Reveal variant="rise" duration={1.2} className={styles.header}>
          <div className="eyebrow">{content.eyebrow}</div>
          <h2 className="h2Section">{content.headline}</h2>
        </Reveal>

        <div className={styles.grid}>
          {content.items.map((item, i) => (
            <Reveal
              key={item.label}
              variant="rise"
              duration={1.1}
              amount={0.2}
              delay={Math.min(i, 3) * 0.06}
              className={styles.card}
            >
              <SystemGlyph name={item.glyph} />
              <h3 className={styles.label}>{item.label}</h3>
              <p className={styles.body}>{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
