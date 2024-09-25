import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; 
import { auth, db } from '../utils/firebase'; // Import Firebase auth and Firestore
import { doc, getDoc } from 'firebase/firestore'; // Firebase Firestore methods

export default function DashboardPage() {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Get the current Firebase authenticated user
        const user = auth.currentUser;

        if (!user) {
          router.push('/login');  // Redirect to login if no user is authenticated
          return;
        }

        const userId = user.uid;
        const email = user.email;

        console.log("User ID:", userId);
        console.log("Email:", email);

        // Set the basic user details
        setUserDetails({
          userId,
          email,
        });

        // Query Firestore for the user's accountType and locationID
        const userDocRef = doc(db, 'users', userId);  // Reference to the user document in Firestore
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const { accountType, locationID } = userDoc.data();
          
          // Check if both fields exist
          if (accountType && locationID) {
            console.log("User has account details.");
            setUserDetails((prevState) => ({
              ...prevState,
              accountType,
              locationID,
            }));
          } else {
            console.log("Redirecting to profile page...");
            router.push('/profile');  // Redirect if account details are missing
          }
        } else {
          console.log("User document does not exist. Redirecting to profile page...");
          router.push('/profile');  // Redirect if the document doesn't exist
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError('Failed to load user details. Please try again.');
      }
    };

    fetchUserDetails(); 
  }, [router]);

  return (
    <div>
      <h1>Dashboard</h1>
      {error ? (
        <p>{error}</p>
      ) : userDetails ? (
        <div>
          <p>Welcome, {userDetails.email}</p>
          <p>User ID: {userDetails.userId}</p>
          {userDetails.accountType && userDetails.locationID && (
            <div>
              <p>Account Type: {userDetails.accountType}</p>
              <p>Location ID: {userDetails.locationID}</p>
            </div>
          )}
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
}
