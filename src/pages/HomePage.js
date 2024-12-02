'use client'; // Ensure this is a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { useUser } from '@/components/authenticate';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Snackbar,
  Alert,
  Stack,
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
          flex: 1, // Ensures the main content takes up the available space
          py: { xs: 4, md: 8 },
        }}
      >
        <Grid container spacing={4} justifyContent="center">
          {/* Dashboard */}
          {/* <Grid item xs={12} sm={6} md={3}>
            <Link href="/dashboard" passHref>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: { xs: 'row', sm: 'column' },
                  alignItems: 'center',
                  textAlign: 'center',
                  p: { xs: 2, sm: 3 },
                  '&:hover': { boxShadow: 6, transform: 'scale(1.05)' },
                  transition: 'all 0.3s',
                }}
              >
                <CardMedia
                  component="img"
                  image="https://cdn-icons-png.flaticon.com/512/11068/11068821.png"
                  alt="Dashboard Icon"
                  sx={{ width: { xs: 50, sm: 80 }, height: { xs: 50, sm: 80 }, mb: { sm: 2 } }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                    Dashboard
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                    Overview of your childcare activities.
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid> */}

          {/* Meal Plan */}
          <Grid item xs={12} sm={6} md={3}>
            <Link href="/mealPlan" passHref>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: { xs: 'row', sm: 'column' },
                  alignItems: 'center',
                  textAlign: 'center',
                  p: { xs: 2, sm: 3 },
                  backgroundColor: colors.cardHover,
                  '&:hover': { backgroundColor: colors.cardHover, boxShadow: 6, transform: 'scale(1.05)' },
                  transition: 'all 0.3s',
                }}
              >
                <CardMedia
                  component="img"
                  image="/icons/Mealplan.png"
                  alt="Meal Plan Icon"
                  sx={{ width: { xs: 50, sm: 80 }, height: { xs: 50, sm: 80 }, mb: { sm: 2 } }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.2rem' },
                      color: darkMode ? '#f1f1f1' : '#333',
                    }}
                  >
                    Meal Plan
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      color: darkMode ? '#bdbdbd' : 'textSecondary', // Slightly lighter text in dark mode
                    }}
                  >
                    View and manage meal plans.
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>

          {/* Event Calendar */}
          <Grid item xs={12} sm={6} md={3}>
            <Link href="/calendar" passHref>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: { xs: 'row', sm: 'column' },
                  alignItems: 'center',
                  textAlign: 'center',
                  p: { xs: 2, sm: 3 },
                  backgroundColor: colors.cardHover,
                  '&:hover': { backgroundColor: colors.cardHover, boxShadow: 6, transform: 'scale(1.05)' },
                  transition: 'all 0.3s',
                }}
              >
                <CardMedia
                  component="img"
                  image="/icons/Calendar.png"
                  alt="Event Calendar Icon"
                  sx={{ width: { xs: 50, sm: 80 }, height: { xs: 50, sm: 80 }, mb: { sm: 2 } }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.2rem' },
                      color: darkMode ? '#f1f1f1' : '#333', // Explicitly set color for header text
                    }}
                  >
                    Event Calendar
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      color: darkMode ? '#bdbdbd' : 'textSecondary', // Slightly lighter text in dark mode
                    }}
                  >
                    Check upcoming events and activities.
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Link href="/newsletter" passHref>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: { xs: 'row', sm: 'column' },
                  alignItems: 'center',
                  textAlign: 'center',
                  p: { xs: 2, sm: 3 },
                  backgroundColor: colors.cardHover,
                  '&:hover': { backgroundColor: colors.cardHover, boxShadow: 6, transform: 'scale(1.05)' },
                  transition: 'all 0.3s',
                }}
              >
                <CardMedia
                  component="img"
                  image="/icons/Newsletter.png"
                  alt="Newsletter Icon"
                  sx={{ width: { xs: 50, sm: 80 }, height: { xs: 50, sm: 80 }, mb: { sm: 2 } }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.2rem' },
                      color: darkMode ? '#f1f1f1' : '#333', // Explicitly set color for header text
                    }}
                  >
                    Newsletter
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      color: darkMode ? '#bdbdbd' : 'textSecondary', // Slightly lighter text in dark mode
                    }}
                  >
                    Stay updated with the latest news.
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>

          {/* Child Progress Report */}
          {user.accountType === 'Parent' && (
            <Grid item xs={12} sm={6} md={3}>
              <Link href="/progressReport" passHref>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: { xs: 'row', sm: 'column' },
                    alignItems: 'center',
                    textAlign: 'center',
                    p: { xs: 2, sm: 3 },
                    backgroundColor: colors.cardHover,
                    '&:hover': { backgroundColor: colors.cardHover, boxShadow: 6, transform: 'scale(1.05)' },
                    transition: 'all 0.3s',
                  }}
                >
                  <CardMedia
                    component="img"
                    image="/icons/ProgressReport.png"
                    alt="Progress Report Icon"
                    sx={{ width: { xs: 50, sm: 80 }, height: { xs: 50, sm: 80 }, mb: { sm: 2 } }}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}
                    >
                      Child Progress
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
                    >
                      Track and celebrate your child’s development milestones.
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          )}
        </Grid>
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
