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
            <li><Link href="/crudTester" className={styles.navItem}>Crud Testing</Link></li>
          </ul>
        </div>

        
        <div className={styles.rightSection}>
          <ul className={styles.navList}>
            {/* 
            <li><Link href="https://big-brother2-pool.auth.us-east-1.amazoncognito.com/login?client_id=69n73oh4j7t8ou9f1u9sqs8e3g&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fbig-brother-psi.vercel.app%2Fdashboard" className={styles.navItem}>Login</Link></li>
            <li><Link href="https://big-brother2-pool.auth.us-east-1.amazoncognito.com/signup?client_id=69n73oh4j7t8ou9f1u9sqs8e3g&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fbig-brother-psi.vercel.app%2Fdashboard" className={styles.navItem}>Register</Link></li>
            */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
