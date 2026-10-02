/**
 * Small orthographic glyphs for the facade systems, in the same hairline
 * language as the panel set-out drawing. Geometry follows the diagrams in the
 * company profile (LS-CP-11).
 */
const STROKE = 'rgba(33,35,37,.55)';
const FILL = 'rgba(33,35,37,.12)';

const GLYPHS = {
  grid: (
    <>
      <path d="M2 2 H86 V54 H2 Z M2 20 H86 M2 37 H86 M30 2 V54 M58 2 V54" />
      <rect x="30" y="20" width="28" height="17" fill={FILL} stroke="none" />
    </>
  ),
  unit: (
    <>
      <path d="M2 2 H40 V25 H2 Z M48 2 H86 V25 H48 Z M2 31 H40 V54 H2 Z" />
      <rect x="48" y="31" width="38" height="23" fill={FILL} />
      <path d="M48 31 H86 V54 H48 Z" />
    </>
  ),
  glazing: (
    <>
      <rect x="2" y="8" width="84" height="40" fill={FILL} strokeDasharray="3 3" />
      <path d="M44 8 V48" />
    </>
  ),
  window: (
    <>
      <path d="M2 8 H42 V48 H2 Z M52 8 H86 V48 H52 Z" />
      <path d="M2 8 L42 28 L2 48" />
      <circle cx="58" cy="30" r="1.6" fill={STROKE} stroke="none" />
    </>
  ),
  louver: (
    <>
      <path d="M2 8 H86 M2 16 H86 M2 24 H86 M2 32 H86 M2 40 H86 M2 48 H86" />
    </>
  ),
  acp: (
    <>
      <path d="M2 2 H28 V25 H2 Z M34 2 H60 V25 H34 Z M66 2 H86 V25 H66 Z" />
      <path d="M2 31 H28 V54 H2 Z M34 31 H60 V54 H34 Z M66 31 H86 V54 H66 Z" strokeDasharray="3 3" />
    </>
  ),
  mesh: (
    <>
      <rect x="2" y="8" width="84" height="40" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
          <circle key={`${r}-${c}`} cx={10 + c * 8} cy={15 + r * 9} r="1.4" fill={STROKE} stroke="none" />
        ))
      )}
    </>
  ),
  canopy: (
    <>
      <path d="M6 2 V54" strokeWidth="1.6" />
      <path d="M6 20 H84 L6 40" />
      <rect x="6" y="36" width="78" height="4" fill={FILL} />
    </>
  ),
};

export default function SystemGlyph({ name }) {
  return (
    <svg viewBox="0 0 88 56" width="88" height="56" aria-hidden="true" focusable="false">
      <g fill="none" stroke={STROKE} strokeWidth=".9" vectorEffect="non-scaling-stroke">
        {GLYPHS[name] ?? GLYPHS.grid}
      </g>
    </svg>
  );
}
