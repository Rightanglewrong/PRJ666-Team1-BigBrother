// pages/mealPlan/index.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLatestMealPlan } from '@/utils/mealPlanAPI';
import { useUser } from '@/components/authenticate';
import { useTheme } from '@/components/ThemeContext'; // Import the theme context
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';

export default function MealPlanIndex() {
  const user = useUser();
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { colorblindMode } = useTheme(); // Access colorblind mode

  // Define original colors
  const originalColors = {
    buttonPrimary: '#1976d2',
    buttonSecondary: '#4caf50',
    background: '#fff',
    text: '#000',
    cardBackground: '#f5f5f5',
    durationBackground: '#E3F2FD',
    durationText: '#1565C0',
    allergensBackground: '#FFEBEE',
    allergensText: '#C62828',
    mealTitle: '#FF7043',
  };

  // Define colorblind-friendly overrides
  const colorblindOverrides = {
    'red-green': {
      buttonPrimary: '#1976d2',
      buttonSecondary: '#e77f24',
      durationBackground: '#E3F2FD',
      allergensBackground: '#FFF4E6',
      allergensText: '#1565C0', // Neutral gray to replace red
      text: '#000', // Default black text
      mealTitle: '#FF7043', // Blue shade to avoid red
    },
    'blue-yellow': {
      buttonPrimary: '#e77f24',
      buttonSecondary: '#3db48c',
      durationBackground: '#FFEBEE',
      durationText: '#e77f24',
      allergensBackground: '#FFEBEE',
      allergensText: '#C62828', // Neutral gray to replace yellow
      text: '#000', // Default black text
      mealTitle: '#9147A9', // Purple to replace blue
    },
  };

  // Merge original colors with colorblind overrides
  const colors = {
    ...originalColors,
    ...(colorblindMode !== 'none' ? colorblindOverrides[colorblindMode] : {}),
  };

  useEffect(() => {
    const fetchLatestMealPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Unauthorized - please log in again.');
        }

        const mealPlanData = await getLatestMealPlan(token, user.locationID);
        setMealPlan(mealPlanData);
        setMessage('');
      } catch (error) {
        if (error.message.includes('Unauthorized')) {
          setMessage('Session expired. Redirecting to login...');
          localStorage.removeItem('token');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setMessage(error.message || 'Error fetching the latest meal plan.');
        }
        setMealPlan(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestMealPlan();
  }, [user, router]);

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        p: 2,
        mb: 4,
        backgroundColor: colors.background,
        color: colors.text,
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: 'bold', color: colors.text, mb: 3 }}
      >
        Weekly Meal Plan
      </Typography>

      {message && (
        <Snackbar
          open={Boolean(message)}
          autoHideDuration={6000}
          onClose={() => setMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="info" onClose={() => setMessage('')}>
            {message}
          </Alert>
        </Snackbar>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : mealPlan ? (
        <>
          <Box
            sx={{
              backgroundColor: colors.durationBackground,
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
              mb: 3,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.durationText }}>
              Meal Plan Duration
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1">
              <strong>Start Date:</strong> {mealPlan.startDate}
            </Typography>
            <Typography variant="body1">
              <strong>End Date:</strong> {mealPlan.endDate}
            </Typography>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center" mt={2}>
            {['Breakfast', 'Lunch', 'Snack'].map((meal, index) => (
              <Card
                key={index}
                sx={{
                  backgroundColor: colors.cardBackground,
                  boxShadow: 3,
                  borderRadius: 3,
                  p: 2,
                  width: '30%',
                  minWidth: '200px',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: colors.mealTitle,
                      fontSize: '1.125rem',
                    }}
                  >
                    {meal}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ mt: 1, color: colors.text }}>
                    {mealPlan[meal.toLowerCase()] || 'Not specified'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: colors.allergensBackground,
              borderRadius: 2,
              boxShadow: 1,
              textAlign: 'center',
            }}
          >
            <Box display="flex" justifyContent="space-around" flexWrap="wrap">
              <Box textAlign="center" minWidth="200px" mb={2}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: colors.allergensText }}
                >
                  Allergens
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {mealPlan.allergens || 'None specified'}
                </Typography>
              </Box>
              <Box textAlign="center" minWidth="200px">
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: colors.allergensText }}
                >
                  Alternatives
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {mealPlan.alternatives || 'None available'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }} // Column for mobile, row for larger screens
            justifyContent="center"
            mt={3}
            gap={2}
            flexWrap="wrap"
          >
            {user && (user.accountType === 'Admin' || user.accountType === 'Staff') && (
              <>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.buttonSecondary,
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    px: 3,
                    '&:hover': {
                      backgroundColor: colors.buttonPrimary,
                    },
                  }}
                  component={Link}
                  href="/mealPlan/create"
                >
                  Create New Meal Plan
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: colors.buttonPrimary,
                    color: colors.buttonPrimary,
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    px: 3,
                    '&:hover': {
                      backgroundColor: colors.buttonSecondary,
                      color: '#fff',
                    },
                  }}
                  component={Link}
                  href={`/mealPlan/${mealPlan.mealPlanID}`}
                >
                  Edit Meal Plan
                </Button>
              </>
            )}
            <Button
              sx={{
                backgroundColor: colors.buttonPrimary,
                color: '#fff',
                textTransform: 'none',
                fontSize: { xs: '0.875rem', md: '1rem' },
                px: 3,
                '&:hover': {
                  backgroundColor: colors.buttonSecondary,
                },
              }}
              component={Link}
              href="/mealPlan/recent"
            >
              View Recent Meal Plans
            </Button>
          </Box>
        </>
      ) : (
        <Box textAlign="center" mt={3}>
          <Typography variant="body1" color="textSecondary">
            No meal plan found.
          </Typography>
          {user && (user.accountType === 'Admin' || user.accountType === 'Staff') && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: colors.buttonSecondary,
                  color: '#fff',
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  px: 3,
                  '&:hover': {
                    backgroundColor: colors.buttonPrimary,
                  },
                }}
                component={Link}
                href="/mealPlan/create"
              >
                Create New Meal Plan
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}
