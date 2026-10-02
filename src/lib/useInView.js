import { useLayoutEffect } from 'react';
import { prefersReducedMotion } from './motion.js';

/**
 * Marks a node `data-armed="true"` (so CSS may hide it) and then
 * `data-in="true"` once it enters the viewport. Fires once.
 *
 * Arming happens in an effect, never in render: if JS or the observer never
 * runs, the node keeps its default visible styling.
 */
export default function useInView(ref, amount = 0.25) {
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return undefined;

    node.dataset.armed = 'true';

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // A block taller than the viewport can never reach the ratio, so
          // treat "its top edge is on screen" as enough for those.
          const tallerThanViewport = entry.boundingClientRect.height > window.innerHeight * 0.9;
          const reached =
            entry.intersectionRatio >= amount || (entry.isIntersecting && tallerThanViewport);
          if (!reached) continue;
          entry.target.dataset.in = 'true';
          observer.unobserve(entry.target);
        }
      },
      { threshold: [0, amount, 0.99] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, amount]);
}
