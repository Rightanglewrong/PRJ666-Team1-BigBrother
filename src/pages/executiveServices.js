'use client'; // Ensure this is a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { getCurrentUser } from '../utils/api'; // Import the API function
import Link from "next/link";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Attempt to get user data (this will validate the token)
        await getCurrentUser();
      } catch (error) {
        console.error('Invalid token:', error);
        setError('Session expired, please log in again.');

        // Remove the invalid token
        localStorage.removeItem('token');

        // Redirect to login page
        router.push('/login');
      }
    };

    validateToken();
  }, [router]);

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.floatingCard}>
        <h1 className={styles.title}>Executive Services</h1>

        <div className={styles.gridSection}>
          {/* Progress Report Section */}
          <Link href="/progressReport" className={styles.gridItem}>
            <div className={styles.calendar}>
              <h2>Progress Reports</h2>
            </div>
          </Link>

          {/* Media Section */}
          <Link href="/media" className={styles.gridItem}>
            <div className={styles.calendar}>
              <h2>Media</h2>
            </div>
          </Link>

          {/* Relationships */}
          <Link href="/relationship" className={styles.gridItem}>
            <div className={styles.calendar}>
              <h2>Relationship</h2>
            </div>
          </Link>

          {/* Relationships */}
          <Link href="/children" className={styles.gridItem}>
            <div className={styles.calendar}>
              <h2>Children</h2>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;