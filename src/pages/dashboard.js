// app/dashboard.js
'use client'; // Ensure this is a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { getCurrentUser } from '../utils/api'; // Import the API function
import { withAuth } from '@/hoc/withAuth';
import {
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';

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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        p: { xs: 2, sm: 3 },
      }}
    >
      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      )}

      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: '800px',
          p: { xs: 2, sm: 4 },
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          animation: 'fadeIn 0.5s ease-in-out',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '2rem', sm: '3rem' },
            fontWeight: 'bold',
            color: '#2c3e50',
            mb: 4,
            textAlign: 'center',
            textShadow: '1px 1px 5px rgba(0, 0, 0, 0.1)',
          }}
        >
          Dashboard
        </Typography>

        {userDetails ? (
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                color: '#27ae60',
                mb: 2,
                textAlign: 'center',
              }}
            >
              Welcome, {userDetails.firstName}
            </Typography>

            <Box
              sx={{
                backgroundColor: '#f9f9f9',
                p: { xs: 2, sm: 3 },
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                mb: 3,
                animation: 'fadeIn 0.8s ease-in-out',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 3,
                }}
              >
                <Typography sx={userInfoStyle}>
                  <strong>First Name:</strong> {userDetails.firstName}
                </Typography>
                <Typography sx={userInfoStyle}>
                  <strong>Last Name:</strong> {userDetails.lastName}
                </Typography>
                <Typography sx={userInfoStyle}>
                  <strong>Account Type:</strong> {userDetails.accountType}
                </Typography>
                <Typography sx={userInfoStyle}>
                  <strong>Location ID:</strong> {userDetails.locationID}
                </Typography>
                <Typography
                  sx={{
                    ...userInfoStyle,
                    gridColumn: { xs: 'span 1', sm: 'span 2' },
                    textAlign: 'center',
                  }}
                >
                  <strong>User ID:</strong> {userDetails.userID}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: '#7f8c8d', fontStyle: 'italic' }}
          >
            Loading user details...
          </Typography>
        )}
      </Paper>

      {/* FadeIn Keyframes for Animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
};

// Custom style for userInfo items
const userInfoStyle = {
  p: 2,
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
  fontSize: '1rem',
  fontWeight: 500,
};

export default withAuth(DashboardPage);
