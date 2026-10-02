import { useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/motion.js';
import styles from './PanelSetOutDrawing.module.css';

/* Geometry is verbatim from the design reference — 3 × 4 bays on a 90px
   pitch, right-hand column 92 wide, one darker "selected" unit at col 2 / row 2. */
const PANELS = [
  { x: 24, y: 24, w: 82 },
  { x: 114, y: 24, w: 82 },
  { x: 204, y: 24, w: 92 },
  { x: 24, y: 114, w: 82 },
  { x: 114, y: 114, w: 82, selected: true },
  { x: 204, y: 114, w: 92 },
  { x: 24, y: 204, w: 82 },
  { x: 114, y: 204, w: 82 },
  { x: 204, y: 204, w: 92 },
  { x: 24, y: 294, w: 82 },
  { x: 114, y: 294, w: 82 },
  { x: 204, y: 294, w: 92 },
];

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/* Scroll-progress windows, in the same units the design reference used:
   `progress` below is the element's position through its own cover range,
   and `entry` converts a percentage of the entry range into that scale. */
const range = (progress, entryStart, coverEnd, entry) =>
  easeOut(clamp01((progress - entryStart * entry) / (coverEnd - entryStart * entry)));

export default function PanelSetOutDrawing({ label, dimension }) {
  const ref = useRef(null);
  // Fully drawn by default: if the scroll listener never runs, the drawing is
  // still complete rather than blank.
  const [{ progress, entry }, setScroll] = useState({ progress: 1, entry: 0 });

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let latched = 0;
    setScroll({ progress: 0, entry: 0 });

    const measure = () => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const cover = window.innerHeight + rect.height;
      // 0 as the drawing's top edge crosses the viewport bottom,
      // 1 once its bottom edge has passed the viewport top.
      const raw = clamp01((window.innerHeight - rect.top) / cover);
      if (raw <= latched) return;
      latched = raw;
      setScroll({ progress: raw, entry: rect.height / cover });
    };

    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const framePhase = range(progress, 0, 0.4, entry);
  const gridPhase = range(progress, 0, 0.55, entry);
  const dimPhase = range(progress, 0.4, 0.6, entry);

  return (
    <div>
      <div className={styles.label}>{label}</div>
      <svg ref={ref} viewBox="0 0 320 400" className={styles.svg} aria-hidden="true">
        {/* 1. Frame, then the inner grid, draw themselves in. */}
        <g stroke="rgba(33,35,37,.28)" strokeWidth=".75" fill="none">
          <path
            d="M20 20 H300 M20 20 V380 M300 20 V380 M20 380 H300"
            strokeDasharray="900"
            strokeDashoffset={900 - 900 * framePhase}
          />
          <path
            d="M20 110 H300 M20 200 H300 M20 290 H300 M110 20 V380 M200 20 V380"
            strokeDasharray="900"
            strokeDashoffset={900 - 900 * gridPhase}
          />
        </g>

        {/* 2. Panels snap into the frame, staggered bay by bay. */}
        <g fill="rgba(33,35,37,.1)" stroke="rgba(33,35,37,.5)" strokeWidth=".75">
          {PANELS.map((panel, i) => {
            const t = range(progress, 0.04 * (i + 1), 0.22 + 0.04 * i, entry);
            return (
              <rect
                key={`${panel.x}-${panel.y}`}
                x={panel.x}
                y={panel.y}
                width={panel.w}
                height="82"
                fill={panel.selected ? 'rgba(33,35,37,.22)' : undefined}
                opacity={t}
                transform={`translate(${(-14 * (1 - t)).toFixed(2)},${(-10 * (1 - t)).toFixed(2)})`}
              />
            );
          })}
        </g>

        {/* 3. Dimension line and module label. */}
        <g stroke="rgba(33,35,37,.45)" strokeWidth=".75" fill="none" opacity={dimPhase}>
          <path d="M20 396 H300 M20 392 V400 M300 392 V400" />
        </g>
        <text
          x="160"
          y="392"
          textAnchor="middle"
          fill="rgba(33,35,37,.6)"
          className={styles.dimText}
          opacity={dimPhase}
        >
          {dimension}
        </text>
      </svg>
    </div>
  );
}
