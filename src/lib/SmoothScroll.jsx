import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { BREAKPOINT, prefersReducedMotion } from './motion.js';

const SmoothScrollContext = createContext({ lenis: null });

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

/**
 * Owns the single Lenis instance and the single requestAnimationFrame loop.
 * The tile parallax runs inside that same loop — see runParallax below.
 *
 * `duration` is the one motion value worth tuning: 0.6 (snappy) to 2.5 (heavy).
 */
export default function SmoothScrollProvider({ children, duration = 1.25 }) {
  const [lenis, setLenis] = useState(null);
  const lenisRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const instance = new Lenis({
      duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    lenisRef.current = instance;
    setLenis(instance);

    const raf = (time) => {
      instance.raf(time);
      runParallax();
      frameRef.current = requestAnimationFrame(raf);
    };
    frameRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameRef.current);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
      clearParallax();
    };
  }, [duration]);

  // Anchor navigation — delegated, so every in-page link routes through Lenis.
  useEffect(() => {
    if (!lenis) return undefined;

    const onClick = (event) => {
      const anchor = event.target.closest?.('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.6 });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [lenis]);

  return (
    <SmoothScrollContext.Provider value={{ lenis }}>{children}</SmoothScrollContext.Provider>
  );
}

/**
 * Per-frame tile drift. Reads `data-depth` off any element tagged
 * `data-tile`, so tiles register themselves purely through markup.
 * Off below the breakpoint, where the tiles stack.
 */
function runParallax() {
  const tiles = document.querySelectorAll('[data-tile]');
  if (!tiles.length) return;

  if (window.innerWidth <= BREAKPOINT) {
    tiles.forEach((tile) => {
      if (tile.style.transform) tile.style.transform = '';
    });
    return;
  }

  const mid = window.innerHeight / 2;
  for (const tile of tiles) {
    const rect = tile.getBoundingClientRect();
    if (rect.bottom < -400 || rect.top > window.innerHeight + 400) continue;
    const depth = parseFloat(tile.dataset.depth || '0.1');
    const offset = ((mid - (rect.top + rect.height / 2)) * depth).toFixed(2);
    tile.style.transform = `translate3d(0,${offset}px,0)`;
  }
}

function clearParallax() {
  document.querySelectorAll('[data-tile]').forEach((tile) => {
    tile.style.transform = '';
  });
}
