import { useEffect, useRef } from 'react';
import styles from './MenuOverlay.module.css';

export default function MenuOverlay({ content, brand, open, onClose, onNavigate }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={content.menuTitle}>
      <div className={styles.top}>
        <span className={styles.title}>
          <img src="/assets/mark-white.svg" alt="" />
          {content.menuTitle}
        </span>
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          {content.close}
        </button>
      </div>

      {/* Every link both navigates and closes the overlay. */}
      <div className={styles.links}>
        {content.menu.map((item) => (
          <a
            key={item.label}
            className={styles.link}
            href={item.href}
            onClick={(event) => onNavigate(event, item.href)}
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className={styles.foot}>
        {brand.location}
        <br />
        {brand.email}
        <br />
        {brand.phone}
      </div>
    </div>
  );
}
