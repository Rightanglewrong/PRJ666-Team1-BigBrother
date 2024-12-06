// src/pages/newsletter/create.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createNewsletter } from '@/utils/newsletterAPI';
import { useUser } from '@/components/authenticate';
import { useTheme } from '@/components/ThemeContext'; // Import ThemeContext
import { Container, Typography, TextField, Button, Snackbar, Alert, Box } from '@mui/material';

export default function CreateNewsletterPage() {
  const userDetails = useUser();
  const { darkMode, colorblindMode } = useTheme(); // Access dark mode and colorblind mode
  const router = useRouter();
  const [newsletter, setNewsletter] = useState({
    title: '',
    content: '',
  });
  const [message, setMessage] = useState('');

  // Define original and colorblind-friendly button colors
  const buttonColors = {
    original: {
      primary: '#3498db',
      secondary: '#2ecc71',
    },
    'red-green': {
      primary: '#1976d2',
      secondary: '#ff9800',
    },
    'blue-yellow': {
      primary: '#e77f24',
      secondary: '#3db48c',
    },
  };

  const colors = buttonColors[colorblindMode] || buttonColors['original'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsletter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (userDetails.accountType !== 'Admin' && userDetails.accountType !== 'Staff') {
      setMessage('User is not authorized to create a newsletter');
      return;
    }

    const locationID = userDetails.locationID;
    const publishedBy = `${userDetails.firstName} ${userDetails.lastName}`;
    const newsletterData = { ...newsletter, locationID, publishedBy };

    try {
      await createNewsletter(token, newsletterData);
      setMessage('Newsletter created successfully');
      setTimeout(() => {
        router.push('/newsletter');
      }, 1000);
    } catch (error) {
      setMessage(
        error.message.includes('403')
          ? 'You do not have permission to create a newsletter.'
          : 'An error occurred while creating the newsletter'
      );
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: darkMode ? '#121212' : '#f7f9fc', // Page-wide dark/light background
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: { xs: 'none', sm: 'center' },
        py: { xs: 'none', sm: 4 },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: { xs: 'none', sm: 3 }, // Remove shadow on mobile
          mb: 4,
          backgroundColor: darkMode ? '#1E1E1E' : '#fff', // Container background for dark/light mode
          color: darkMode ? '#f1f1f1' : '#2c3e50', // Text color
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            color: darkMode ? '#f1f1f1' : '#2c3e50',
            fontWeight: 'bold',
          }}
        >
          Create Newsletter
        </Typography>

        {message && (
          <Snackbar
            open={Boolean(message)}
            autoHideDuration={6000}
            onClose={() => setMessage('')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setMessage('')}
              severity="info"
              sx={{
                width: '100%',
                backgroundColor: darkMode ? '#333' : undefined,
                color: darkMode ? '#fff' : undefined,
              }}
            >
              {message}
            </Alert>
          </Snackbar>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Title"
            name="title"
            value={newsletter.title}
            onChange={handleInputChange}
            required
            fullWidth
            variant="outlined"
            sx={{
              input: { color: darkMode ? '#f1f1f1' : '#333' },
              label: { color: darkMode ? '#f1f1f1' : '#333' },
            }}
          />
          <TextField
            label="Content"
            name="content"
            value={newsletter.content}
            onChange={handleInputChange}
            required
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            sx={{
              input: { color: darkMode ? '#f1f1f1' : '#333' },
              label: { color: darkMode ? '#f1f1f1' : '#333' },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: colors.primary,
              color: '#fff',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: colors.secondary },
            }}
            fullWidth
          >
            Create Newsletter
          </Button>
        </Box>

        <Box textAlign="center" mt={2}>
          <Button
            onClick={() => router.push('/newsletter')}
            variant="text"
            sx={{
              color: colors.primary,
              '&:hover': { color: colors.secondary },
            }}
          >
            Back to Newsletter List
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
