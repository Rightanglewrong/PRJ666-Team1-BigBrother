import { useState, useEffect } from 'react';
import { getUserProfile } from '../utils/api'; // Import the backend API call function
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';  // Assuming you still want to use Firebase auth for authentication state
import styles from './Profile.module.css';

export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationID, setLocationID] = useState('');
  const [accountType, setAccountType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from the backend using the uid
          const profile = await getUserProfile(user.uid);

          if (profile) {
            // Populate the fields with the data retrieved from the backend
            setEmail(profile.email || '');
            setPhone(profile.phone || '');
            setLocationID(profile.locationID || '');
            setAccountType(profile.accountType || '');
          }
        } catch (err) {
          setError('Failed to load profile data');
          console.error(err);
        }
        setLoading(false);
      } else {
        setLoading(false); // User not logged in
      }
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    // Logic for updating user data in Firebase (you can add this if needed)
    console.log('Updating user info', { email, phone, locationID, accountType });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Profile</h1>
      <form className={styles.form} onSubmit={handleUpdate}>
        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled
        />
        <label className={styles.label}>Phone</label>
        <input
          className={styles.input}
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <label className={styles.label}>Location ID</label>
        <input
          className={styles.input}
          type="text"
          value={locationID}
          onChange={(e) => setLocationID(e.target.value)}
        />
        <label className={styles.label}>Account Type</label>
        <input
          className={styles.input}
          type="text"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
        />
        <button className={styles.button} type="submit">Update Info</button>
      </form>
    </div>
  );
}
