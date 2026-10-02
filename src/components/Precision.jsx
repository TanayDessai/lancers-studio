import Reveal from './Reveal.jsx';
import styles from './Precision.module.css';

/**
 * Occupies the pull-quote slot the handoff gave to a testimonial. The quote is
 * the studio's own, from the company profile — the site carries no client
 * testimonial because there is none to carry.
 */
export default function Precision({ content }) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal variant="fade" amount={0.4} className="eyebrow">
          {content.eyebrow}
        </Reveal>

        <Reveal as="blockquote" variant="rise" className={styles.quote}>
          {content.quote}
        </Reveal>

        <Reveal variant="fade" className={styles.attribution}>
          <div>
            {content.attribution}
            <br />
            <span className={styles.role}>{content.role}</span>
          </div>
        </Reveal>

        <Reveal variant="fade" duration={1.3} amount={0.12} className={styles.checklist}>
          {content.checklist.map((item) => (
            <div key={item.index} className={styles.check}>
              <span className={styles.checkIndex}>{item.index}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </Reveal>

        <Reveal variant="fade" duration={1.3} amount={0.2} className={styles.tools}>
          <div className={styles.toolsLabel}>{content.tools.label}</div>
          <div className={styles.toolsList}>
            {content.tools.items.map((tool) => (
              <span key={tool} className={styles.tool}>
                {tool}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
