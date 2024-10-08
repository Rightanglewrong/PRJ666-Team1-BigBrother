// app/dashboard.js
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../utils/api'; // Import the new API function
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState('');

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getCurrentUser();
        setUserDetails(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user details. Please log in again.');
      }
    };

    fetchUserDetails();
  }, []);

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
}
