"use client"; // Ensure this is a Client Component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import { useUser } from "@/components/authenticate";
import Link from "next/link";
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
  Paper,
} from '@mui/material';

export default function HomePage() {
  const user = useUser();
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    if (!user) {
      setError("Session expired, please log in again.");

      // Remove the invalid token if any exists
      localStorage.removeItem("token");

      // Redirect to login page
      router.push("/login");
    }
  }, [user, router]);
  
  {error && (
    <Snackbar
      open
      autoHideDuration={6000}
      onClose={() => setError("")}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity="error" variant="filled">
        {error}
      </Alert>
    </Snackbar>
  )}

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f7f7f7', // light gray fallback
        backgroundImage: "url('/background/background1.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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

      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#fff',
          py: { xs: 6, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '3rem' } }}>
            Welcome to Big Brother App
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', md: '1.5rem' } }}>
            Simplifying Childcare Management for a Brighter Tomorrow
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Grid container spacing={6} justifyContent="center">
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
                  '&:hover': { boxShadow: 6, transform: 'scale(1.05)' },
                  transition: 'all 0.3s',
                }}
              >
                <CardMedia
                  component="img"
                  image="https://cdn-icons-png.flaticon.com/512/2224/2224109.png"
                  alt="Meal Plan Icon"
                  sx={{ width: { xs: 50, sm: 80 }, height: { xs: 50, sm: 80 }, mb: { sm: 2 } }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                    Meal Plan
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
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
                  p: 3,
                  '&:hover': { boxShadow: 6, transform: 'scale(1.05)' },
                  transition: 'all 0.3s',
                }}
              >
                <CardMedia
                  component="img"
                  image="https://static-00.iconduck.com/assets.00/calendar-icon-1995x2048-tot17508.png"
                  alt="Event Calendar Icon"
                  sx={{ width: { xs: 50, sm: 80 }, height: { xs: 50, sm: 80 }, mb: { sm: 2 } }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                    Event Calendar
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
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
                  '&:hover': { boxShadow: 6, transform: 'scale(1.05)' },
                  transition: 'all 0.3s',
                }}
              >
                <CardMedia
                  component="img"
                  image="https://cdn-icons-png.flaticon.com/512/7305/7305498.png"
                  alt="Newsletter Icon"
                  sx={{ width: { xs: 50, sm: 80 }, height: { xs: 50, sm: 80 }, mb: { sm: 2 } }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                    Newsletter
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                    Stay updated with the latest news.
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        </Grid>
      </Container>

      <Box
        sx={{
          py: 4,
          backgroundColor: '#333',
          color: 'white',
          textAlign: 'center',
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
            © {new Date().getFullYear()} Big Brother App. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}