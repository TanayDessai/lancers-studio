import { useRef } from 'react';
import useInView from '../lib/useInView.js';

/**
 * Scroll reveal wrapper. Three variants, matching the design:
 *   rise — translateY(30px) + fade. Headings, paragraphs, button rows.
 *   fade — fade only. Eyebrows, meta rows, the projects gallery.
 *   wipe — translateY(46px) scale(1.04) + fade.
 *
 * Content renders visible and is only hidden once the observer is wired up,
 * so nothing depends on JS to become readable. Reveals fire once.
 */
export default function Reveal({
  as: Tag = 'div',
  variant = 'rise',
  delay = 0,
  duration,
  amount = 0.25,
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);
  useInView(ref, amount);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      data-variant={variant}
      style={{
        animationDelay: delay ? `${delay}s` : undefined,
        animationDuration: duration ? `${duration}s` : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
