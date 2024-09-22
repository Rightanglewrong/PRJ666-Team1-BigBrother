import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/router'; // Use Next.js router for navigation
import { checkUser } from '../utils/api'; // Import your checkUser function

export default function DashboardPage() {
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { username, userId } = await getCurrentUser();

        if (username && userId) {
          console.log("username", username);
          console.log("user id", userId);

          // Save user details in state
          setUserDetails({
            username,
            userId,
          });

          // Pass userId (or 'sub') to checkUser and await the response
          const result = await checkUser(userId);
          
          if (result.hasAccountDetails) {
            // User has the required details, stay on the dashboard
            console.log("User has account details.");
          } else {
            // Redirect to the profile page to complete details
            console.log("Redirecting to profile page...");
            router.push('/profile'); // Navigate to the profile page
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [router]); // Add router as a dependency

  return (
    <div>
      <h1>Dashboard</h1>
      {userDetails ? (
        <div>
          <p>Welcome, {userDetails.username}</p>
          <p>User ID: {userDetails.userId}</p>
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
}
