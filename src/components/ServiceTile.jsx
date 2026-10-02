import { useRef } from 'react';
import useInView from '../lib/useInView.js';
import styles from './ServiceTile.module.css';

/**
 * `data-tile` / `data-depth` are read by the parallax pass inside the Lenis
 * rAF loop (see lib/SmoothScroll.jsx) — the tile registers itself via markup.
 *
 * The tile deliberately does NOT use <Reveal>: a keyframe animation on
 * `transform` outranks the inline transform the parallax loop writes, which
 * would freeze the drift. Above the breakpoint the tile is simply present at
 * its staggered offset and drifts; the rise-in reveal exists only in the
 * stacked ≤860px layout, where parallax is off.
 */
export default function ServiceTile({ tile }) {
  const ref = useRef(null);
  useInView(ref, 0.1);

  return (
    <div
      ref={ref}
      className={styles.tile}
      data-tile="1"
      data-depth={tile.depth}
      style={{ marginTop: tile.marginTop }}
    >
      <div className={styles.frame}>
        <img src={tile.image} alt={tile.alt} loading="lazy" decoding="async" />
      </div>
      <div className={styles.caption}>
        <span>{tile.label}</span>
        <span className={styles.index}>{tile.index}</span>
      </div>
      <p className={styles.body}>{tile.body}</p>
    </div>
  );
}
