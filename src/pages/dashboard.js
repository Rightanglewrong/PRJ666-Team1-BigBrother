import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify'; // Import Amplify's Auth module
import { useRouter } from 'next/router'; // Use Next.js router for navigation
import { checkUser } from '../utils/api'; // Import your checkUser function

export default function DashboardPage() {
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Check if the user has a valid session
        const session = await Auth.currentSession();
        if (!session) {
          throw new Error("No active session found");
        }
        
        // If session exists, get the current authenticated user
        const user = await Auth.currentAuthenticatedUser();
        const { attributes } = user;
        const userId = attributes.sub;  // This is the user's unique Cognito ID
        const email = attributes.email;

        console.log("User ID (sub):", userId);
        console.log("Email:", email);

        // Save user details in state
        setUserDetails({
          userId,
          email,
        });

        // Pass userId (or 'sub') to checkUser and await the response
        const result = await checkUser(userId);

        if (result.hasAccountDetails) {
          console.log("User has account details.");
        } else {
          console.log("Redirecting to profile page...");
          router.push('/profile'); // Redirect to profile page
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        // If there's an error (like no session), redirect to login

      }
    };

    fetchUserDetails(); // Call the function
  }, [router]); // Add router as a dependency

  return (
    <div>
      <h1>Dashboard</h1>
      {userDetails ? (
        <div>
          <p>Welcome, {userDetails.username}</p>
          <p>User ID: {userDetails.userId}</p>
          <p>Email: {userDetails.email}</p>
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
};
