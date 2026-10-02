import Reveal from './Reveal.jsx';
import PanelSetOutDrawing from './PanelSetOutDrawing.jsx';
import styles from './About.module.css';

export default function About({ content }) {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.col}>
          <Reveal variant="fade" amount={0.4} className="eyebrow">
            {content.eyebrow}
          </Reveal>
          <Reveal as="h2" variant="rise" className={`h2Section ${styles.headline}`}>
            {content.headline}
          </Reveal>
          <Reveal as="p" variant="rise" className={styles.body}>
            {content.body}
          </Reveal>
          <Reveal as="p" variant="rise" duration={1.2} className={styles.body}>
            {content.body2}
          </Reveal>

          {/* Based in / Focus / Services, on a shared hairline. */}
          <Reveal variant="fade" duration={1.3} className={styles.facts}>
            {content.facts.map((fact) => (
              <div key={fact.label} className={styles.fact}>
                <span className={styles.factLabel}>{fact.label}</span>
                <span className={styles.factValue}>{fact.value}</span>
              </div>
            ))}
          </Reveal>

          <Reveal variant="rise" duration={1.2} className={styles.buttonRow}>
            <a className="btn" href={content.cta.href}>
              {content.cta.label}
            </a>
          </Reveal>
        </div>

        <Reveal variant="fade" duration={1.4} amount={0.15}>
          <PanelSetOutDrawing
            label={content.drawingLabel}
            dimension={content.drawingDimension}
          />
        </Reveal>
      </div>
    </section>
  );
}
