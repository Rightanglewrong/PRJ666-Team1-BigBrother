// app/dashboard.js
'use client'; // Ensure this is a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { getCurrentUser } from '../utils/api'; // Import the API function
import { withAuth } from '@/hoc/withAuth';
import styles from './dashboard.module.css';

const DashboardPage = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize the router

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getCurrentUser();
        setUserDetails(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user details. Please log in again.');

        // Remove any stored token from localStorage
        localStorage.removeItem('token');

        // Redirect to login page if an error occurs
        router.push('/login');
      }
    };

    fetchUserDetails();
  }, [router]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboard}>
        <h1 className={styles.title}>Dashboard</h1>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : userDetails ? (
          <div>
            <p className={styles.welcome}>Welcome, {userDetails.firstName}</p>
            <div className={styles.userDetails}>
              <div className={styles.userInfo}>
                <p><strong>First Name: </strong>{userDetails.firstName}</p>
                <p><strong>Last Name: </strong>{userDetails.lastName}</p>
                <p><strong>Account Type: </strong>{userDetails.accountType}</p>
                <p><strong>Location ID: </strong>{userDetails.locationID}</p>
                <p><strong>User ID: </strong>{userDetails.userID}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className={styles.loading}>Loading user details...</p>
        )}
      </div>
    </div>
  );
};

export default withAuth(DashboardPage);
