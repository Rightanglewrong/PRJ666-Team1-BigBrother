"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from 'aws-amplify';
import Link from 'next/link';
import styles from './NavBar.module.css';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check user authentication status when the component is mounted
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkUserStatus();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await Auth.signOut();
      setIsLoggedIn(false);
      router.push('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
            <li><Link href="/dynamoCrudTester" className={styles.navItem}> Dynamo CRUD Testing </Link></li>
          </ul>
        </div>

        <div className={styles.rightSection}>
          <ul className={styles.navList}>
          {isLoggedIn && (
              <li>
                <button onClick={handleLogout} className={styles.navItem}>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
