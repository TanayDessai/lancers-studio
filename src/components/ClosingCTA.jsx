import Reveal from './Reveal.jsx';
import styles from './ClosingCTA.module.css';

export default function ClosingCTA({ content }) {
  return (
    <section id="contact" className={styles.section}>
      <img
        className={styles.mark}
        src="/assets/mark-ink.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />

      {/* Faint facade-panel line drawing — geometry verbatim from the reference. */}
      <svg viewBox="0 0 400 400" aria-hidden="true" className={styles.drawing}>
        <g stroke="rgba(33,35,37,.5)" strokeWidth=".7" fill="none">
          <path d="M60 40 H340 V300 H60 Z M60 126 H340 M60 213 H340 M200 40 V300" />
          <path d="M60 40 L200 126 M340 40 L200 126" />
          <path d="M40 40 V300 M34 40 H46 M34 300 H46" />
          <path d="M60 320 H340 M60 314 V326 M340 314 V326" />
          <rect x="66" y="46" width="128" height="74" fill="rgba(33,35,37,.06)" />
        </g>
      </svg>

      <div className={styles.inner}>
        <Reveal variant="fade" amount={0.4} className="eyebrow">
          {content.eyebrow}
        </Reveal>
        <Reveal as="h2" variant="rise" className={styles.headline}>
          {content.headline}
        </Reveal>
        <Reveal as="p" variant="rise" duration={1.2} className={styles.body}>
          {content.body}
        </Reveal>
        <Reveal variant="rise" duration={1.2} className={styles.kicker}>
          {content.kicker}
        </Reveal>
        <Reveal variant="rise" duration={1.2} className={styles.buttons}>
          {content.buttons.map((button) => (
            <a key={button.label} className={styles.button} href={button.href}>
              {button.label}
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
