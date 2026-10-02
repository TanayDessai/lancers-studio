import { useLayoutEffect, useRef, useState, useId } from 'react';
import { prefersReducedMotion } from '../lib/motion.js';
import {
  TOTAL,
  STATIC_TIME,
  clamp01,
  buildFacade,
  groundState,
  builtFloors,
  slabState,
  roofState,
  panelState,
  craneState,
  mullionOpacity,
  camera,
  reflection,
} from '../lib/facade.js';
import styles from './FacadeInstall.module.css';

/**
 * Scroll-scrubbed facade install sequence.
 *
 * A pinned section: `SCROLL_VIEWPORTS` viewports of scroll are mapped onto the
 * 20-second storyboard, so the sequence advances as you scroll and runs
 * backwards when you scroll back up. Roughly six seconds of timeline per
 * viewport of travel.
 *
 * The SVG is rendered once, with the STATIC_TIME frame baked into the markup.
 * Every subsequent frame is written straight to the DOM inside a rAF pass —
 * 250-odd nodes cannot go through React at 60fps, and the static markup means
 * the section still reads correctly if the driver never runs.
 */
/* The scroll travel that maps onto the 20s timeline lives in the stylesheet
   (`--install-viewports`), so that motion-off can collapse the section without
   a re-render. */
const EPSILON = 0.004;

export default function FacadeInstall({ content, floors = 26, glass, reflect = 1.6 }) {
  const sectionRef = useRef(null);
  const svgRef = useRef(null);
  const floorRef = useRef(null);
  const steps = content.workflow;
  const [stage, setStage] = useState(steps.length - 1);

  const uid = useId().replace(/:/g, '');
  const model = useRef(null);
  if (!model.current || model.current.floors !== floors) model.current = buildFacade(floors);
  const m = model.current;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg || prefersReducedMotion()) return undefined;

    /* Collect the nodes once, alongside the geometry they belong to. */
    const nodes = {
      ground: [...svg.querySelectorAll('[data-ground]')].map((el, i) => ({
        el,
        line: m.ground[i],
        length: Math.hypot(m.ground[i].b[0] - m.ground[i].a[0], m.ground[i].b[1] - m.ground[i].a[1]),
        last: -1,
      })),
      columns: [...svg.querySelectorAll('[data-column]')].map((el, i) => ({
        el,
        base: m.columns[i].base,
        last: -1,
      })),
      slabs: [...svg.querySelectorAll('[data-slab]')].map((el, i) => ({
        el,
        slab: m.slabs[i],
        last: -1,
      })),
      panels: [...svg.querySelectorAll('[data-panel]')].map((el, i) => ({
        el,
        panel: m.panels[i],
        last: -1,
      })),
      roof: svg.querySelector('[data-roof]'),
      crane: svg.querySelector('[data-crane]'),
      mast: svg.querySelector('[data-crane-mast]'),
      jib: svg.querySelector('[data-crane-jib]'),
      hook: svg.querySelector('[data-crane-hook]'),
      mullions: svg.querySelector('[data-mullions]'),
      cameraGroup: svg.querySelector('[data-camera]'),
      sheen: svg.querySelector('[data-sheen]'),
    };

    let lastStage = -1;
    let queued = false;
    let frame = 0;

    const apply = (time) => {
      /* Scene 1 — the site grid draws itself in. */
      for (const g of nodes.ground) {
        const t = groundState(g.line, time);
        if (Math.abs(t - g.last) < EPSILON) continue;
        g.last = t;
        g.el.setAttribute('stroke-dashoffset', (g.length * (1 - t)).toFixed(2));
      }

      /* Scene 2 — structure stacks up floor by floor. */
      const built = builtFloors(m, time);
      const builtHeight = built * m.floorHeight;
      for (const c of nodes.columns) {
        if (Math.abs(builtHeight - c.last) < EPSILON) continue;
        c.last = builtHeight;
        c.el.setAttribute('y2', (c.base[1] - builtHeight).toFixed(2));
      }
      for (const s of nodes.slabs) {
        const t = slabState(s.slab, m, time);
        if (Math.abs(t - s.last) < EPSILON) continue;
        s.last = t;
        s.el.style.opacity = t;
      }

      /* Scenes 3 & 4 — panels swing in, then the glazing sweeps up. */
      for (const p of nodes.panels) {
        const st = panelState(p.panel, time);
        if (Math.abs(st.opacity - p.last) < EPSILON) continue;
        p.last = st.opacity;
        p.el.style.opacity = st.opacity;
        p.el.setAttribute(
          'transform',
          st.opacity >= 1
            ? ''
            : `translate(${st.dx.toFixed(2)} ${st.dy.toFixed(2)}) rotate(${st.spin.toFixed(2)} ${p.panel.centre[0].toFixed(2)} ${p.panel.centre[1].toFixed(2)})`
        );
      }

      /* The roof plane closes as the glazing tops out. */
      nodes.roof.style.opacity = roofState(time);

      /* The crane rises with the frame and is struck once the facade seals. */
      const cr = craneState(m, time);
      nodes.crane.style.opacity = cr.opacity;
      nodes.mast.setAttribute('y2', cr.topY.toFixed(2));
      nodes.jib.setAttribute('transform', `translate(0 ${(cr.topY - m.crane.fullTop[1]).toFixed(2)})`);
      nodes.hook.style.opacity = cr.hookOpacity;

      /* Scene 5 — mullions and transoms, revealed as the camera pushes in. */
      nodes.mullions.style.opacity = mullionOpacity(time);

      const cam = camera(m, time);
      nodes.cameraGroup.setAttribute(
        'transform',
        `translate(${m.centre[0].toFixed(2)} ${m.centre[1].toFixed(2)}) scale(${cam.scale.toFixed(4)}) translate(${(-cam.x).toFixed(2)} ${(-cam.y).toFixed(2)})`
      );

      /* Scene 6 — the reflection sweep across the finished faces. */
      const sheen = reflection(m, time, reflect);
      nodes.sheen.style.opacity = sheen.opacity;
      nodes.sheen.setAttribute('x', sheen.x.toFixed(2));

      /* Readout: which workflow stage the scroll is sitting in. */
      const index = Math.min(steps.length - 1, Math.floor((time / TOTAL) * steps.length));
      if (index !== lastStage) {
        lastStage = index;
        setStage(index);
        if (floorRef.current) floorRef.current.textContent = String(index + 1).padStart(2, '0');
      }
    };

    const draw = () => {
      queued = false;
      const travel = section.offsetHeight - window.innerHeight;
      const progress = travel > 0 ? clamp01(-section.getBoundingClientRect().top / travel) : 0;
      apply(progress * TOTAL);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [m, floors, reflect, steps.length]);

  /* The frame baked into the markup: fully glazed, camera pulled back. */
  const t = STATIC_TIME;
  const staticBuilt = builtFloors(m, t) * m.floorHeight;
  const staticCrane = craneState(m, t);
  const glassFill = glass || 'rgba(255,255,255,.1)';

  return (
    <section ref={sectionRef} id="install" className={styles.section}>
      <div className={styles.pin}>
        <div className={styles.stage}>
          <div className={styles.col}>
            <div className="eyebrow eyebrowOnDark">{content.eyebrow}</div>
            <h2 className={styles.headline}>{content.headline}</h2>
            <p className={styles.body}>{content.body}</p>

            {/* The engineering workflow, advanced by scroll. */}
            <ol className={styles.rail}>
              {steps.map((step, i) => (
                <li
                  key={step}
                  className={styles.scene}
                  data-active={i === stage ? 'true' : undefined}
                  aria-current={i === stage ? 'step' : undefined}
                >
                  {step}
                </li>
              ))}
            </ol>

            <div className={styles.coordinated}>
              <span className={styles.coordinatedLabel}>{content.coordinated.label}</span>
              <span className={styles.coordinatedList}>
                {content.coordinated.items.join('  ·  ')}
              </span>
            </div>

            <div className={styles.readout}>
              <span>
                {content.stageLabel}{' '}
                <span ref={floorRef}>{String(steps.length).padStart(2, '0')}</span> /{' '}
                {String(steps.length).padStart(2, '0')}
              </span>
              <span className={styles.hint}>{content.hint}</span>
            </div>
          </div>

          <div className={styles.drawing}>
            <svg
              ref={svgRef}
              viewBox={m.viewBox}
              className={styles.svg}
              aria-label={content.headline}
              role="img"
            >
              <defs>
                <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <clipPath id={`${uid}-faces`}>
                  {m.faces.map((face, i) => (
                    <polygon key={i} points={face} />
                  ))}
                </clipPath>
              </defs>

              <g data-camera vectorEffect="non-scaling-stroke">
                {/* Scene 1 — site grid */}
                <g stroke="rgba(255,255,255,.18)" strokeWidth=".6" fill="none">
                  {m.ground.map((line, i) => {
                    const length = Math.hypot(line.b[0] - line.a[0], line.b[1] - line.a[1]);
                    return (
                      <line
                        key={i}
                        data-ground
                        x1={line.a[0].toFixed(2)}
                        y1={line.a[1].toFixed(2)}
                        x2={line.b[0].toFixed(2)}
                        y2={line.b[1].toFixed(2)}
                        strokeDasharray={length.toFixed(2)}
                        strokeDashoffset={(length * (1 - groundState(line, t))).toFixed(2)}
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}
                </g>

                {/* Scene 2 — columns and floor slabs */}
                <g fill="none">
                  {m.columns.map((column, i) => (
                    <line
                      key={i}
                      data-column
                      x1={column.base[0].toFixed(2)}
                      y1={column.base[1].toFixed(2)}
                      x2={column.base[0].toFixed(2)}
                      y2={(column.base[1] - staticBuilt).toFixed(2)}
                      stroke={column.perimeter ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.2)'}
                      strokeWidth={column.perimeter ? '.8' : '.6'}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>
                <g fill="none" stroke="rgba(255,255,255,.4)" strokeWidth=".7">
                  {m.slabs.map((slab) => (
                    <polygon
                      key={slab.f}
                      data-slab
                      points={slab.points}
                      style={{ opacity: slabState(slab, m, t) }}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>

                {/* Scenes 3 & 4 — the unitised panels */}
                <g fill={glassFill} stroke="rgba(255,255,255,.42)" strokeWidth=".5">
                  {m.panels.map((panel, i) => {
                    const st = panelState(panel, t);
                    return (
                      <polygon
                        key={i}
                        data-panel
                        points={panel.pointsAttr}
                        style={{ opacity: st.opacity }}
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}
                </g>

                {/* The roof plane, sealing the open top of the frame */}
                <polygon
                  data-roof
                  points={m.slabs[m.slabs.length - 1].points}
                  fill="rgba(255,255,255,.07)"
                  stroke="rgba(255,255,255,.45)"
                  strokeWidth=".7"
                  style={{ opacity: roofState(t) }}
                  vectorEffect="non-scaling-stroke"
                />

                {/* Scene 5 — mullion and transom grid */}
                <path
                  data-mullions
                  d={m.mullionPath}
                  fill="none"
                  stroke="rgba(255,255,255,.5)"
                  strokeWidth=".3"
                  style={{ opacity: mullionOpacity(t) }}
                  vectorEffect="non-scaling-stroke"
                />

                {/* Scene 6 — reflection sweep, clipped to the sealed faces */}
                <g clipPath={`url(#${uid}-faces)`}>
                  <rect
                    data-sheen
                    x={m.faceBox.minX}
                    y={m.faceBox.minY}
                    width={(m.faceBox.maxX - m.faceBox.minX) * 0.5}
                    height={m.faceBox.maxY - m.faceBox.minY}
                    fill={`url(#${uid}-sheen)`}
                    style={{ opacity: 0 }}
                  />
                </g>

                {/* The tower crane */}
                <g
                  data-crane
                  fill="none"
                  stroke="rgba(255,255,255,.45)"
                  strokeWidth=".7"
                  style={{ opacity: staticCrane.opacity }}
                >
                  <line
                    data-crane-mast
                    x1={m.crane.base[0].toFixed(2)}
                    y1={m.crane.base[1].toFixed(2)}
                    x2={m.crane.base[0].toFixed(2)}
                    y2={staticCrane.topY.toFixed(2)}
                    vectorEffect="non-scaling-stroke"
                  />
                  <g data-crane-jib transform={`translate(0 ${(staticCrane.topY - m.crane.fullTop[1]).toFixed(2)})`}>
                    <line
                      x1={(m.crane.fullTop[0] + m.crane.jib[0]).toFixed(2)}
                      y1={m.crane.fullTop[1].toFixed(2)}
                      x2={(m.crane.fullTop[0] + m.crane.jib[1]).toFixed(2)}
                      y2={m.crane.fullTop[1].toFixed(2)}
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* kingpost and pendant ties */}
                    <path
                      d={`M${m.crane.fullTop[0] + m.crane.jib[0]} ${m.crane.fullTop[1]}L${m.crane.fullTop[0]} ${m.crane.fullTop[1] - 30}L${m.crane.fullTop[0] + m.crane.jib[1]} ${m.crane.fullTop[1]}M${m.crane.fullTop[0]} ${m.crane.fullTop[1]}L${m.crane.fullTop[0]} ${m.crane.fullTop[1] - 30}`}
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* counterweight */}
                    <rect
                      x={(m.crane.fullTop[0] + m.crane.jib[1] - 14).toFixed(2)}
                      y={(m.crane.fullTop[1] + 1).toFixed(2)}
                      width="13"
                      height="7"
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* hoist line and hook block */}
                    <g data-crane-hook style={{ opacity: staticCrane.hookOpacity }}>
                      <line
                        x1={(m.crane.fullTop[0] + m.crane.trolley).toFixed(2)}
                        y1={m.crane.fullTop[1].toFixed(2)}
                        x2={(m.crane.fullTop[0] + m.crane.trolley).toFixed(2)}
                        y2={(m.crane.fullTop[1] + 26).toFixed(2)}
                        vectorEffect="non-scaling-stroke"
                      />
                      <rect
                        x={(m.crane.fullTop[0] + m.crane.trolley - 3).toFixed(2)}
                        y={(m.crane.fullTop[1] + 26).toFixed(2)}
                        width="6"
                        height="4"
                        vectorEffect="non-scaling-stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
