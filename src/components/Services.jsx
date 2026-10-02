import Reveal from './Reveal.jsx';
import ServiceTile from './ServiceTile.jsx';
import styles from './Services.module.css';

export default function Services({ content }) {
  return (
    <section id="services" className={styles.section}>
      <div className={styles.inner}>
        <Reveal variant="rise" duration={1.2} className={styles.header}>
          <div className="eyebrow">{content.eyebrow}</div>
          <h2 className={`h2Section ${styles.headline}`}>{content.headline}</h2>
        </Reveal>

        <div className={styles.tiles}>
          {content.tiles.map((tile) => (
            <ServiceTile key={tile.index} tile={tile} />
          ))}
        </div>

        <Reveal as="p" variant="rise" duration={1.2} className={styles.footnote}>
          {content.footnote}
        </Reveal>
      </div>
    </section>
  );
}
