import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router'; 
import { getCurrentUser } from '../utils/api'; // Import the new API function

export default function DashboardPage() {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  // Function to check if user is authenticated
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token'); 
    if (!token) {
      // If no token, redirect to login
      router.push('/login');
      return;
    }

    
    try {
      // Fetch user details from API
      const userData = await getCurrentUser();
      setUserDetails(userData); // Set user details in state

      // Optionally trigger a recheck in NavBar
      localStorage.setItem('userLoggedIn', 'true'); 
      window.dispatchEvent(new Event('storage'));

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user details. Please log in again.');
      router.push('/login'); // Redirect to login on error
    }
  }, [router]);

  // On component mount, check if user is authenticated
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div>
      <h1>Dashboard</h1>
      {error ? (
        <p>{error}</p>
      ) : userDetails ? (
        <div>
          <p>Welcome, {userDetails.firstName}</p>
          <p>User ID: {userDetails.userID}</p>
          <div>
            <p>First Name: {userDetails.firstName}</p>
            <p>First Name: {userDetails.lastName}</p>
            <p>Account Type: {userDetails.accountType}</p>
            <p>Location ID: {userDetails.locationID}</p>
          </div>
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
}
