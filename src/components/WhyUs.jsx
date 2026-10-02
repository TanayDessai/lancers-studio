import Reveal from './Reveal.jsx';
import styles from './WhyUs.module.css';

export default function WhyUs({ content }) {
  return (
    <section id="why" className={styles.section}>
      <div className={styles.inner}>
        <Reveal variant="rise" duration={1.2} className={styles.header}>
          <div className="eyebrow eyebrowOnDark">{content.eyebrow}</div>
          <h2 className={styles.headline}>{content.headline}</h2>
        </Reveal>

        <div className={styles.grid}>
          {content.items.map((item, i) => (
            <Reveal
              key={item.index}
              variant="rise"
              duration={1.1}
              amount={0.2}
              delay={Math.min(i % 3, 2) * 0.07}
              className={styles.item}
            >
              <div className={styles.top}>
                <span className={styles.index}>{item.index}</span>
                <h3 className={styles.label}>{item.label}</h3>
              </div>
              <p className={styles.body}>{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
