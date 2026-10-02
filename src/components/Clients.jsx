import Reveal from './Reveal.jsx';
import styles from './Clients.module.css';

export default function Clients({ content }) {
  return (
    <section id="clients" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.intro}>
          <Reveal variant="fade" amount={0.4} className="eyebrow">
            {content.eyebrow}
          </Reveal>
          <Reveal as="h2" variant="rise" className={`h2Section ${styles.headline}`}>
            {content.headline}
          </Reveal>
          <Reveal as="p" variant="rise" duration={1.2} className={styles.body}>
            {content.body}
          </Reveal>
        </div>

        <Reveal variant="fade" duration={1.3} amount={0.12} className={styles.table}>
          <div className={styles.head}>
            <span>{content.columns.client}</span>
            <span>{content.columns.support}</span>
          </div>
          {content.items.map((item) => (
            <div key={item.client} className={styles.row}>
              <span className={styles.client}>{item.client}</span>
              <span className={styles.support}>{item.support}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
