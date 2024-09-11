import Link from 'next/link';
import styles from './NavBar.module.css';

const NavBar = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>
            Big Brother
          </Link>
          <ul className={styles.navList}>
            <li><Link href="/dashboard" className={styles.navItem}>Dashboard</Link></li>
            <li><Link href="/profile" className={styles.navItem}>Profile</Link></li>
            <li><Link href="/media" className={styles.navItem}>Media</Link></li>
          </ul>
        </div>

        <div className={styles.rightSection}>
          <ul className={styles.navList}>
            <li><Link href="/login" className={styles.navItem}>Login</Link></li>
            <li><Link href="/register" className={styles.navItem}>Register</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
