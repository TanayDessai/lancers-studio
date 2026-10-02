import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, BREAKPOINT } from '../lib/motion.js';
import styles from './Hero.module.css';

/**
 * The hero background is a muted, looping video over a still poster.
 *
 * The poster is frame 0 of the loop, so it is what paints first (and what
 * carries LCP), and the video fades over it only once frames are actually
 * advancing. If autoplay is refused — iOS low power mode, a strict autoplay
 * policy, a decode failure — the poster simply stays, and the hero looks
 * exactly as it did before the video existed.
 *
 * The video is skipped entirely under reduced motion and under Save-Data.
 */
export default function Hero({ content, brand, media }) {
  const videoRef = useRef(null);
  const [src, setSrc] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // A full-bleed looping background is motion; honour the preference.
    if (prefersReducedMotion()) return;
    if (navigator.connection?.saveData) return;

    // `media` on <source> is not reliably honoured for video, so pick here.
    const small = window.matchMedia(`(max-width: ${BREAKPOINT}px)`).matches;
    setSrc(small ? media.mobile : media.desktop);
  }, [media]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    // autoPlay alone is not enough everywhere; a rejected play() is fine —
    // the poster is already showing.
    video.play().catch(() => {});
  }, [src]);

  return (
    <section id="top" className={styles.hero}>
      <div className={styles.media}>
        <picture>
          <source
            type="image/webp"
            media="(max-width: 768px)"
            srcSet="/media/hero-poster-mobile.webp"
          />
          <source type="image/webp" srcSet="/media/hero-poster.webp" />
          <img
            className={styles.poster}
            src={media.poster}
            alt={media.alt}
            fetchpriority="high"
            decoding="async"
            width="1280"
            height="720"
          />
        </picture>
        {src && (
          <video
            ref={videoRef}
            className={styles.video}
            data-playing={playing ? 'true' : undefined}
            src={src}
            poster={media.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
            onPlaying={() => setPlaying(true)}
          />
        )}
      </div>
      <div className={styles.scrim} />

      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.wordmark}>
            <img src="/assets/mark-white.svg" alt={brand.fullName} />
            <div className={styles.wordmarkText}>{brand.name}</div>
          </div>
          <div className={styles.meta}>
            {brand.discipline}
            <br />
            {brand.location}
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={`eyebrow eyebrowOnDark ${styles.eyebrow}`}>{content.eyebrow}</div>
          <h1 className={styles.title}>{content.headline}</h1>
          <div className={styles.ctaRow}>
            <a className="textLink" href={content.cta.href}>
              {content.cta.label}
            </a>
            <div className={styles.stat}>{content.stat}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
