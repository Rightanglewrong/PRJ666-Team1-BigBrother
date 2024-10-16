'use client'; // Ensure this is a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { getCurrentUser } from '../utils/api'; // Import the API function
import Image from 'next/image'; // Import Image component from next/image
import Link from "next/link";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Attempt to get user data
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
        <h1 className={styles.title}>Home Page</h1>

        <div className={styles.gridSection}>
          {/* DashBoard Section */}
          <Link href="/dashboard" className={styles.gridItem}>
            <div className={styles.calendar}>
              <h2>DashBoard</h2>
              {/* Use Image component instead of img */}
              <Image
                src="https://cdn-icons-png.flaticon.com/512/11068/11068821.png"
                alt="DashBoard Icon"
                width={128}
                height={128}
                className={styles.calendarIcon}
              />
            </div>
          </Link>

          {/* Meal Plan Section */}
          <Link href="/mealPlan" className={styles.gridItem}>
            <div className={styles.calendar}>
              <h2>Meal Plan</h2>
              {/* Use Image component instead of img */}
              <Image
                src="https://cdn-icons-png.flaticon.com/512/2224/2224109.png"
                alt="Meal Plan Icon"
                width={128}
                height={128}
                className={styles.calendarIcon}
              />
            </div>
          </Link>

          {/* Event Calendar Section */}
          <Link href="/calendar" className={styles.gridItem}>
            <div className={styles.calendar}>
              <h2>Event Calendar</h2>
              {/* Use Image component instead of img */}
              <Image
                src="https://static-00.iconduck.com/assets.00/calendar-icon-1995x2048-tot17508.png"
                alt="Event Calendar Icon"
                width={128}
                height={128}
                className={styles.calendarIcon}
              />
            </div>
          </Link>

          {/* News or Update Section */}
          <Link href="/newsletter" className={styles.gridItem}>
            <div className={styles.news}>
              <h2>News or Update</h2>
              {/* Use Image component instead of img */}
              <Image
                src="https://cdn-icons-png.flaticon.com/512/7305/7305498.png"
                alt="News Icon"
                width={128}
                height={128}
                className={styles.calendarIcon}
              />
            </div>
          </Link>
        </div>

        <div className={styles.footer}>
          <Link href="/contacts" className={styles.footerLink}>
            Contacts
          </Link>
          <Link href="/terms-of-service" className={styles.footerLink}>
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
