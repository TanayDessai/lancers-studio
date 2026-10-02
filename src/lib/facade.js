/**
 * Facade install sequence — geometry and timeline.
 *
 * Recreated from the `Facade Install.dc` storyboard: six scenes, 20 seconds,
 * driven by scroll rather than a clock. Everything here is pure — the
 * component owns the DOM writes.
 */

/* ---------- Timeline ---------- */

export const SCENES = [
  { name: 'Site', dur: 2.5 },
  { name: 'Frame', dur: 4 },
  { name: 'Hoist', dur: 3.5 },
  { name: 'Glaze', dur: 4 },
  { name: 'Detail', dur: 3.5 },
  { name: 'Sweep', dur: 2.5 },
];

export const CUES = {};
export const TOTAL = (() => {
  let t = 0;
  for (const scene of SCENES) {
    CUES[scene.name] = [t, t + scene.dur];
    t += scene.dur;
  }
  return t;
})();

/** The frame rendered when motion is off, or before the driver takes over:
 *  fully glazed, camera still pulled back. */
export const STATIC_TIME = CUES.Glaze[1] - 0.05;

export function sceneIndexAt(time) {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (time >= CUES[SCENES[i].name][0]) return i;
  }
  return 0;
}

/* ---------- Easing ---------- */

export const clamp01 = (n) => Math.min(1, Math.max(0, n));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

/** Progress through a [start, end] window in timeline seconds. */
const span = (time, start, end) => clamp01((time - start) / (end - start));

/* ---------- Isometric projection ---------- */

const ISO_X = Math.cos(Math.PI / 6);
const BAY = 30; // plan module — one unitised panel
const FLOOR_H = 12; // storey height
const BAYS_X = 4; // bays across the left-hand face
const BAYS_Y = 3; // bays across the right-hand face
const PER_FLOOR = BAYS_X + BAYS_Y; // only two faces are ever visible

const project = (x, y, z) => [(x - y) * ISO_X, (x + y) * 0.5 - z];
const poly = (points) => points.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');

/* How far a panel travels to reach its slot, and how far it is rotated. */
const HOIST_FLOORS = 2; // the floors the crane visibly swings in
const SNAP = [-7, -5]; // the short "seating" move every other panel makes

/* The band the Detail push-in frames. Mullions only exist here — they are
   invisible at full zoom-out, so generating them for all 26 floors would be
   ~700 wasted path segments. */
const DETAIL_FLOORS = [7, 18];

export function buildFacade(floors) {
  const xMax = BAYS_X * BAY;
  const yMax = BAYS_Y * BAY;
  const top = floors * FLOOR_H;

  /* --- Scene 1: the site grid, drawn from the footprint outwards --- */
  const pad = 2 * BAY;
  const [gx0, gx1, gy0, gy1] = [-pad, xMax + pad, -pad, yMax + pad];
  const ground = [];
  const midX = xMax / 2;
  const midY = yMax / 2;
  const reach = Math.max(gx1 - midX, gy1 - midY);

  for (let y = gy0; y <= gy1; y += BAY) {
    ground.push({ a: project(gx0, y, 0), b: project(gx1, y, 0), delay: Math.abs(y - midY) / reach });
  }
  for (let x = gx0; x <= gx1; x += BAY) {
    ground.push({ a: project(x, gy0, 0), b: project(x, gy1, 0), delay: Math.abs(x - midX) / reach });
  }

  /* --- Scene 2: columns and slabs --- */
  const columns = [];
  for (let i = 0; i <= BAYS_X; i++) {
    for (let j = 0; j <= BAYS_Y; j++) {
      columns.push({
        base: project(i * BAY, j * BAY, 0),
        perimeter: i === 0 || i === BAYS_X || j === 0 || j === BAYS_Y,
      });
    }
  }

  const slabs = [];
  for (let f = 0; f <= floors; f++) {
    const z = f * FLOOR_H;
    slabs.push({
      f,
      points: poly([
        project(0, 0, z),
        project(xMax, 0, z),
        project(xMax, yMax, z),
        project(0, yMax, z),
      ]),
    });
  }

  /* --- The crane. Mast grows with the build, then holds. --- */
  const craneX = xMax + 1.2 * BAY;
  const craneY = 0.6 * BAY;
  const crane = {
    base: project(craneX, craneY, 0),
    fullTop: project(craneX, craneY, top + 3 * FLOOR_H),
    jib: [-210, 54], // screen-space reach, toward the tower and counter-jib
    trolley: -128,
  };
  const hook = [crane.fullTop[0] + crane.trolley, crane.fullTop[1] + 26];

  /* --- Scenes 3 & 4: the panels --- */
  const panels = [];
  for (let f = 0; f < floors; f++) {
    const z0 = f * FLOOR_H;
    const z1 = (f + 1) * FLOOR_H;
    for (let j = 0; j < BAYS_Y; j++) {
      const y0 = j * BAY;
      const y1 = (j + 1) * BAY;
      panels.push({
        f,
        bay: j,
        slot: j,
        points: [
          project(xMax, y0, z0),
          project(xMax, y1, z0),
          project(xMax, y1, z1),
          project(xMax, y0, z1),
        ],
      });
    }
    for (let i = 0; i < BAYS_X; i++) {
      const x0 = i * BAY;
      const x1 = (i + 1) * BAY;
      panels.push({
        f,
        bay: i,
        slot: BAYS_Y + i,
        points: [
          project(x0, yMax, z0),
          project(x1, yMax, z0),
          project(x1, yMax, z1),
          project(x0, yMax, z1),
        ],
      });
    }
  }

  const [hoistStart, hoistEnd] = CUES.Hoist;
  const [glazeStart, glazeEnd] = CUES.Glaze;
  const hoistCount = HOIST_FLOORS * PER_FLOOR;

  for (const panel of panels) {
    const centre = panel.points
      .reduce((acc, p) => [acc[0] + p[0] / 4, acc[1] + p[1] / 4], [0, 0]);
    panel.centre = centre;
    panel.pointsAttr = poly(panel.points);

    if (panel.f < HOIST_FLOORS) {
      // Swung in from the crane hook, one at a time.
      const order = panel.f * PER_FLOOR + panel.slot;
      panel.t0 = lerp(hoistStart, hoistEnd - 1.15, order / hoistCount);
      panel.t1 = panel.t0 + 1.15;
      panel.from = [hook[0] - centre[0], hook[1] - centre[1]];
      panel.spin = -9;
    } else {
      // Sealed in bottom-to-top as the glazing sweeps up the tower.
      const up = (panel.f - HOIST_FLOORS) / (floors - HOIST_FLOORS);
      panel.t0 = lerp(glazeStart, glazeEnd - 0.95, up) + (panel.slot / PER_FLOOR) * 0.22;
      panel.t1 = panel.t0 + 0.62;
      panel.from = SNAP;
      panel.spin = 0;
    }
  }

  /* --- Scene 5: mullion and transom grid, within the framed band only --- */
  const mullions = [];
  for (let f = DETAIL_FLOORS[0]; f < Math.min(DETAIL_FLOORS[1], floors); f++) {
    const z0 = f * FLOOR_H;
    const z1 = (f + 1) * FLOOR_H;
    const zm = (z0 + z1) / 2;
    for (let j = 0; j < BAYS_Y; j++) {
      const y0 = j * BAY;
      const y1 = (j + 1) * BAY;
      const ym = (y0 + y1) / 2;
      mullions.push([project(xMax, y0, zm), project(xMax, y1, zm)]);
      mullions.push([project(xMax, ym, z0), project(xMax, ym, z1)]);
    }
    for (let i = 0; i < BAYS_X; i++) {
      const x0 = i * BAY;
      const x1 = (i + 1) * BAY;
      const xm = (x0 + x1) / 2;
      mullions.push([project(x0, yMax, zm), project(x1, yMax, zm)]);
      mullions.push([project(xm, yMax, z0), project(xm, yMax, z1)]);
    }
  }
  const mullionPath = mullions
    .map(([a, b]) => `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`)
    .join('');

  /* --- Scene 6: the faces, as a clip for the reflection sweep --- */
  const faces = [
    poly([
      project(xMax, 0, 0),
      project(xMax, yMax, 0),
      project(xMax, yMax, top),
      project(xMax, 0, top),
    ]),
    poly([
      project(0, yMax, 0),
      project(xMax, yMax, 0),
      project(xMax, yMax, top),
      project(0, yMax, top),
    ]),
  ];

  /* --- Bounds, so the camera sits at identity when pulled back --- */
  const all = [
    ...ground.flatMap((g) => [g.a, g.b]),
    ...panels.flatMap((p) => p.points),
    crane.base,
    crane.fullTop,
    [crane.fullTop[0] + crane.jib[0], crane.fullTop[1]],
    [crane.fullTop[0] + crane.jib[1], crane.fullTop[1]],
  ];
  const margin = 26;
  const minX = Math.min(...all.map((p) => p[0])) - margin;
  const maxX = Math.max(...all.map((p) => p[0])) + margin;
  const minY = Math.min(...all.map((p) => p[1])) - margin;
  const maxY = Math.max(...all.map((p) => p[1])) + margin;

  return {
    floors,
    ground,
    columns,
    slabs,
    panels,
    crane,
    mullionPath,
    faces,
    top,
    columnTopY: (built) => -built, // screen y of a column head, relative to its base
    viewBox: `${minX.toFixed(1)} ${minY.toFixed(1)} ${(maxX - minX).toFixed(1)} ${(maxY - minY).toFixed(1)}`,
    centre: [(minX + maxX) / 2, (minY + maxY) / 2],
    detailTarget: project(BAYS_X * BAY, BAYS_Y * BAY, ((DETAIL_FLOORS[0] + DETAIL_FLOORS[1]) / 2) * FLOOR_H),
    faceBox: { minX, maxX, minY, maxY },
    floorHeight: FLOOR_H,
  };
}

/* ---------- Per-actor state at a given time ---------- */

export function groundState(line, time) {
  const [start, end] = CUES.Site;
  const window = (end - start) * 0.55;
  const t0 = start + (end - start - window) * line.delay;
  return easeOut(span(time, t0, t0 + window));
}

/** How many floors of structure stand at `time`. Linear, because the slab
 *  schedule is derived from it — easing one and not the other lets the columns
 *  outrun the slabs they are supposed to be carrying. */
export function builtFloors(model, time) {
  const [start, end] = CUES.Frame;
  return span(time, start, end) * model.floors;
}

/** A slab is complete one storey below the column head. */
export function slabState(slab, model, time) {
  return easeOut(clamp01(builtFloors(model, time) - slab.f + 1));
}

/** The roof plane closes once the glazing tops out. */
export function roofState(time) {
  const [, glazeEnd] = CUES.Glaze;
  return easeOut(span(time, glazeEnd - 1.1, glazeEnd));
}

export function panelState(panel, time) {
  const t = easeOut(span(time, panel.t0, panel.t1));
  return {
    opacity: t,
    dx: panel.from[0] * (1 - t),
    dy: panel.from[1] * (1 - t),
    spin: panel.spin * (1 - t),
  };
}

export function craneState(model, time) {
  const [, frameEnd] = CUES.Frame;
  const built = builtFloors(model, time) * model.floorHeight;
  const rise = model.crane.base[1] - (built + 3 * model.floorHeight);
  // Visible from the moment the frame starts; struck once the facade is sealed.
  const fade = easeOut(span(time, CUES.Frame[0], CUES.Frame[0] + 0.8))
    * (1 - easeOut(span(time, CUES.Sweep[0] - 0.6, CUES.Sweep[0] + 0.8)));
  return {
    opacity: fade,
    // Screen y grows downward, so the shorter mast is the larger value.
    topY: Math.max(rise, model.crane.fullTop[1]),
    // The hoist line only carries something while panels are being swung in.
    hookOpacity: easeOut(span(time, CUES.Hoist[0] - 0.4, CUES.Hoist[0] + 0.4))
      * (1 - easeOut(span(time, CUES.Hoist[1] - 0.3, CUES.Hoist[1] + 0.5))),
    settled: time > frameEnd,
  };
}

export function mullionOpacity(time) {
  const [start, end] = CUES.Detail;
  return easeOut(span(time, start + 0.9, end))
    * (1 - easeOut(span(time, CUES.Sweep[0], CUES.Sweep[0] + 1.4)));
}

/** Camera pushes in through Detail, pulls back over the first half of Sweep. */
export function camera(model, time) {
  const [detailStart, detailEnd] = CUES.Detail;
  const [sweepStart] = CUES.Sweep;
  const push = easeInOut(span(time, detailStart - 0.5, detailEnd));
  const pull = easeInOut(span(time, sweepStart, sweepStart + 1.6));
  const k = push * (1 - pull);
  const [cx, cy] = model.centre;
  const [tx, ty] = model.detailTarget;
  return {
    scale: lerp(1, 7, k),
    x: lerp(cx, tx, k),
    y: lerp(cy, ty, k),
  };
}

/** The reflection band that sweeps the sealed facade. `reflect` scales its peak. */
export function reflection(model, time, reflect) {
  const [start, end] = CUES.Sweep;
  const t = span(time, start + 0.4, end);
  const width = model.faceBox.maxX - model.faceBox.minX;
  return {
    opacity: Math.sin(Math.PI * t) * 0.16 * reflect,
    x: lerp(model.faceBox.minX - width, model.faceBox.maxX, t),
  };
}
