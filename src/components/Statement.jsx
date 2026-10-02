import Reveal from './Reveal.jsx';
import styles from './Statement.module.css';

export default function Statement({ content }) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal variant="fade" amount={0.4} className="eyebrow">
          {content.eyebrow}
        </Reveal>
        <Reveal as="p" variant="rise" className={styles.statement}>
          {content.statement}
        </Reveal>
        <Reveal as="p" variant="rise" duration={1.2} className={styles.body}>
          {content.body}
        </Reveal>

        {/* The six-step process, as a diamond rail on the section's hairline. */}
        <Reveal variant="fade" duration={1.4} amount={0.15} className={styles.rail}>
          {content.steps.map((step) => (
            <div key={step.label} className={styles.step}>
              <span className={styles.marker} aria-hidden="true">◆</span>
              <span className={styles.stepLabel}>{step.label}</span>
              <span className={styles.stepNote}>{step.note}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
