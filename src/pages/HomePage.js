'use client'; // Ensure this is a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { useUser } from '@/components/authenticate';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Snackbar,
  Alert,
  Stack,
  Container,
} from '@mui/material';
import { useTheme } from '@/components/ThemeContext'; // Import ThemeContext

export default function HomePage() {
  const user = useUser();
  const { darkMode } = useTheme(); // Access the darkMode state
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    if (!user) {
      setError('Session expired, please log in again.');

      // Remove the invalid token if any exists
      localStorage.removeItem('token');

      // Redirect to login page
      router.push('/login');
    }
  }, [user, router]);

  {
    error && (
      <Snackbar
        open
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    );
  }

  // Define dark mode styles
  const colors = {
    background: darkMode ? '#121212' : '#f7f7f7',
    text: darkMode ? '#f1f1f1' : '#333',
    cardBackground: darkMode ? '#1e1e1e' : '#ffffff',
    cardHover: darkMode ? '#333' : '#f7f7f7',
    footerBackground: darkMode ? '#1e1e1e' : '#333',
    footerText: darkMode ? '#f1f1f1' : 'white',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.background,
        backgroundImage: darkMode ? 'none' : "url('/background/background1.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: colors.text,
      }}
    >
      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}

      {/* Header Section */}
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#fff',
          py: { xs: 6, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: '1.8rem', md: '3rem' } }}
          >
            Welcome to Big Brother!
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', md: '1.5rem' } }}>
            Your Partner in Simplifying Childcare Management
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.9rem', md: '1.2rem' } }}>
            Stay informed, manage schedules, and connect effortlessly with your child&#39;s daycare.
          </Typography>
        </Container>
      </Box>

      {/* Main Content Section */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          py: { xs: 4, md: 8 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {/* The card to show */}
          {[
            {
              href: '/mealPlan',
              imgSrc: '/icons/Mealplan.png',
              title: 'Meal Plan',
              description: 'View and manage meal plans.',
            },
            {
              href: '/calendar',
              imgSrc: '/icons/Calendar.png',
              title: 'Event Calendar',
              description: 'Check upcoming events and activities.',
            },
            {
              href: '/newsletter',
              imgSrc: '/icons/Newsletter.png',
              title: 'Newsletter',
              description: 'Stay updated with the latest news.',
            },
            ...(user.accountType === 'Parent'
              ? [
                  {
                    href: '/progressReport',
                    imgSrc: '/icons/ProgressReport.png',
                    title: 'Child Progress',
                    description: 'Track and celebrate your child’s development milestones.',
                  },
                ]
              : []),
          ].map(({ href, imgSrc, title, description }, index) => (
            <Link href={href} passHref>
              <Box
                key={index}
                sx={{
                  flex: '1 1 calc(25% - 16px)',
                  maxWidth: '300px',
                  minWidth: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: colors.cardBackground,
                  borderRadius: 2,
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: colors.cardHover,
                    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                <CardMedia
                  component="img"
                  image={imgSrc}
                  alt={`${title} Icon`}
                  sx={{
                    width: { xs: 60, sm: 80 },
                    height: { xs: 60, sm: 80 },
                    mb: 2,
                  }}
                />

                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '1.6rem' },
                      color: colors.text,
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '1.1rem' },
                      color: darkMode ? '#bdbdbd' : 'textSecondary',
                      mt: 1,
                    }}
                  >
                    {description}
                  </Typography>
                </CardContent>
              </Box>
            </Link>
          ))}
        </Box>
      </Container>

      <Box
        sx={{
          py: 4,
          backgroundColor: colors.footerBackground,
          color: colors.footerText,
          textAlign: 'center',
          mt: 'auto',
        }}
      >
        <Container maxWidth="sm">
          <Stack direction="row" spacing={3} justifyContent="center">
            <Link href="/contacts" passHref>
              <Button color="inherit" sx={{ textTransform: 'none' }}>
                Contacts
              </Button>
            </Link>
            <Link href="/terms-of-service" passHref>
              <Button color="inherit" sx={{ textTransform: 'none' }}>
                Terms of Service
              </Button>
            </Link>
          </Stack>
          <Typography variant="body2" sx={{ mt: 2 }}>
            © {new Date().getFullYear()} Big Brother App. Supporting Parents Every Step of the Way.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
