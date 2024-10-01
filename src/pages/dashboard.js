import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router'; 
import { getCurrentUser } from '../utils/api'; // Import the new API function
import styles from './Dashboard.module.css';

export default function DashboardPage() {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  // Function to check if user is authenticated
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token'); 
    if (!token) {
      router.push('/login');
      return;
    }

    
    try {
      // Fetch user details from API
      const userData = await getCurrentUser();
      setUserDetails(userData);

      // Optionally trigger a recheck in NavBar
      localStorage.setItem('userLoggedIn', 'true'); 
      window.dispatchEvent(new Event('storage'));

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user details. Please log in again.');
      router.push('/login');
    }
  }, [router]);

  // On component mount, check if user is authenticated
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
                <p>First Name: {userDetails.firstName}</p>
                <p>Last Name: {userDetails.lastName}</p>
                <p>Account Type: {userDetails.accountType}</p>
                <p>Location ID: {userDetails.locationID}</p>
                <p>User ID: {userDetails.userID}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className={styles.loading}>Loading user details...</p>
        )}
      </div>
    </div>
  );
}
