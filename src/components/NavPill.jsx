import styles from './NavPill.module.css';

export default function NavPill({ content, onOpenMenu }) {
  return (
    <nav className={styles.pill}>
      <a className={styles.brand} href="#top">
        <img src="/assets/mark-white.svg" alt="" />
        {content.logoLabel}
      </a>
      <span className={styles.divider} />
      <a className={styles.home} href={content.home.href}>
        {content.home.label}
      </a>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onOpenMenu}
        aria-label="Menu"
        aria-haspopup="dialog"
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>
    </nav>
  );
}
