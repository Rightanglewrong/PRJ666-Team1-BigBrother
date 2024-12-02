// src/pages/mealPlan/create.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createMealPlan } from '../../utils/mealPlanAPI';
import { useUser } from '@/components/authenticate';
import { useTheme } from '@/components/ThemeContext'; // Import the theme context
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Divider,
} from '@mui/material';

export default function CreateMealPlanPage() {
  const router = useRouter();
  const user = useUser();
  const { darkMode, colorblindMode } = useTheme(); // Access dark mode and colorblind mode
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  const [mealPlan, setMealPlan] = useState({
    startDate: today.toISOString().split('T')[0],
    endDate: nextMonth.toISOString().split('T')[0],
    breakfast: '',
    lunch: '',
    snack: '',
    allergens: '',
    alternatives: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Define original colors
  const originalColors = {
    background: darkMode ? '#121212' : '#FFFAF0',
    containerBackground: darkMode ? '#1E1E1E' : '#ffffff',
    textPrimary: darkMode ? '#f1f1f1' : '#2c3e50',
    textSecondary: darkMode ? '#64b5f6' : '#3498db',
    fieldBackground: darkMode ? '#2c2c2c' : '#f5f5f5',
    buttonBackground: darkMode ? '#3498db' : '#1976d2',
    buttonHover: darkMode ? '#1565c0' : '#155DA8',
  };

  // Define colorblind-friendly overrides
  const colorblindOverrides = {
    'red-green': {
      background: '#FFF4E6',
      textPrimary: '#1565C0',
      textSecondary: '#1976D2',
      buttonBackground: '#1976D2',
      buttonHover: '#155DA8',
    },
    'blue-yellow': {
      background: '#FFEBEE',
      textPrimary: '#e77f24',
      textSecondary: '#3db48c',
      buttonBackground: '#e77f24',
      buttonHover: '#c75b1e',
    },
  };

  // Merge original colors with colorblind overrides
  const colors = {
    ...originalColors,
    ...(colorblindMode !== 'none' ? colorblindOverrides[colorblindMode] : {}),
  };

  useEffect(() => {
    if (!user) {
      setMessage('User is not authenticated');
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMealPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('User is not authenticated');
      return router.push('/login');
    }

    let daycareID = user.locationID;
    let fName = user.firstName;
    let lName = user.lastName;
    let createdBy = `${fName} ${lName}`;
    const mealPlanData = {
      ...mealPlan,
      allergens: mealPlan.allergens.trim() === '' ? 'N/A' : mealPlan.allergens,
      alternatives: mealPlan.alternatives.trim() === '' ? 'N/A' : mealPlan.alternatives,
      createdBy,
      daycareID,
    };

    try {
      await createMealPlan(token, mealPlanData);
      setMessage('Meal Plan created successfully');
      router.push('/mealPlan');
    } catch (error) {
      setMessage('An error occurred while creating the meal plan: ' + error);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.background,
        color: colors.textPrimary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          mt: { xs: 0, sm: 4 }, // Hide top margin on mobile
          p: { xs: 0, sm: 3 }, // Remove padding on mobile
          backgroundColor: { xs: 'transparent', sm: colors.containerBackground }, // Transparent on mobile
          borderRadius: { xs: 0, sm: 2 }, // No border radius on mobile
          boxShadow: { xs: 'none', sm: 3 }, // No shadow on mobile
          mb: { xs: 0, sm: 4 }, // Remove bottom margin on mobile
          color: colors.textPrimary,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: colors.textPrimary, fontWeight: 'bold' }}
        >
          Create Meal Plan
        </Typography>

        {message && (
          <Snackbar
            open={Boolean(message)}
            autoHideDuration={6000}
            onClose={() => setMessage('')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="info" onClose={() => setMessage('')}>
              {message}
            </Alert>
          </Snackbar>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Date Fields */}
          <Typography variant="h6" sx={{ color: colors.textSecondary, fontWeight: 'bold' }}>
            Duration
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Start Date"
              type="date"
              name="startDate"
              value={mealPlan.startDate}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
                style: { color: colors.textPrimary }, // Ensures the label text matches the theme
              }}
              InputProps={{
                style: { color: colors.textPrimary, backgroundColor: colors.fieldBackground }, // Ensures the input text color matches the theme
              }}
              required
            />
            <TextField
              label="End Date"
              type="date"
              name="endDate"
              value={mealPlan.endDate}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
                style: { color: colors.textPrimary },
              }}
              InputProps={{
                style: { color: colors.textPrimary, backgroundColor: colors.fieldBackground },
              }}
              required
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Meal Fields */}
          <Typography variant="h6" sx={{ color: colors.textSecondary, fontWeight: 'bold' }}>
            Meals
          </Typography>
          <TextField
            label="Breakfast"
            name="breakfast"
            value={mealPlan.breakfast}
            onChange={handleInputChange}
            required
            multiline
            rows={2}
            InputLabelProps={{
              style: { color: colors.textPrimary },
            }}
            InputProps={{
              style: { color: colors.textPrimary, backgroundColor: colors.fieldBackground },
            }}
          />
          <TextField
            label="Lunch"
            name="lunch"
            value={mealPlan.lunch}
            onChange={handleInputChange}
            required
            multiline
            rows={2}
            InputLabelProps={{
              style: { color: colors.textPrimary },
            }}
            InputProps={{
              style: { color: colors.textPrimary, backgroundColor: colors.fieldBackground },
            }}
          />
          <TextField
            label="Snack"
            name="snack"
            value={mealPlan.snack}
            onChange={handleInputChange}
            required
            multiline
            rows={2}
            InputLabelProps={{
              style: { color: colors.textPrimary },
            }}
            InputProps={{
              style: { color: colors.textPrimary, backgroundColor: colors.fieldBackground },
            }}
          />

          <Divider sx={{ my: 2 }} />

          {/* Allergens and Alternatives Fields */}
          <Typography variant="h6" sx={{ color: colors.textSecondary, fontWeight: 'bold' }}>
            Additional Info
          </Typography>
          <TextField
            label="Allergens"
            name="allergens"
            value={mealPlan.allergens}
            onChange={handleInputChange}
            variant="outlined"
            InputLabelProps={{
              style: { color: colors.textPrimary },
            }}
            InputProps={{
              style: { color: colors.textPrimary, backgroundColor: colors.fieldBackground },
            }}
          />
          <TextField
            label="Alternatives"
            name="alternatives"
            value={mealPlan.alternatives}
            onChange={handleInputChange}
            variant="outlined"
            InputLabelProps={{
              style: { color: colors.textPrimary },
            }}
            InputProps={{
              style: { color: colors.textPrimary, backgroundColor: colors.fieldBackground },
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: colors.buttonBackground,
              color: '#fff',
              '&:hover': { backgroundColor: colors.buttonHover },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Meal Plan'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
