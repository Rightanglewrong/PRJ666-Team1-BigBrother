"use client"
import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify'; 
import { useRouter } from 'next/router'; 
import { checkUser } from '../utils/api'; 

export default function DashboardPage() {
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const session = await Auth.currentSession(); // Get current session
        const user = await Auth.currentAuthenticatedUser(); // Get current authenticated user
        const { attributes } = user;
        const userId = attributes.sub;
        const email = attributes.email;

        console.log("User ID (sub):", userId);
        console.log("Email:", email);

        setUserDetails({
          userId,
          email,
        });

        const result = await checkUser(userId); // Pass userId to checkUser function
        if (result.hasAccountDetails) {
          console.log("User has account details.");
        } else {
          console.log("Redirecting to profile page...");
          router.push('/profile'); 
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails(); 
  }, [router]);

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
