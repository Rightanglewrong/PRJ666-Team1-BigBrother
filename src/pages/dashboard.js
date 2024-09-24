import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify'; 
import { useRouter } from 'next/router'; 
import { checkUser } from '../utils/api'; 

export default function DashboardPage() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true); // To manage loading state
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Get the current session (handles OAuth code exchange)
        const session = await Auth.currentSession();

        // Get authenticated user details
        const user = await Auth.currentAuthenticatedUser();
        const { attributes } = user;
        const userId = attributes.sub;
        const email = attributes.email;
        const idToken = session.getIdToken().getJwtToken();
        const accessToken = session.getAccessToken().getJwtToken();

        console.log("User ID (sub):", userId);
        console.log("Email:", email);

        setUserDetails({
          userId,
          email,
        });

        // Call the backend to check if the user has account details
        const result = await checkUser(userId); // Pass userId to checkUser function

        if (result.hasAccountDetails) {
          console.log("User has account details.");
          setLoading(false); // Set loading to false
        } else {
          console.log("Redirecting to profile page with tokens...");

          // Redirect to profile page, passing tokens as query params
          router.push({
            pathname: '/profile',
            query: { idToken, accessToken }, // Pass tokens as query parameters
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        // Optional: You can handle redirect to the login page here if session fetch fails
      }
    };

    fetchUserDetails(); 
  }, [router]);

  if (loading) {
    return <p>Loading user details...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {userDetails ? (
        <div>
          <p>Welcome, {userDetails.email}</p>
          <p>User ID: {userDetails.userId}</p>
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
}
