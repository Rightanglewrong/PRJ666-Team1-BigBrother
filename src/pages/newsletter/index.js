// src/pages/newsletter/index.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllNewsletters } from '@/utils/newsletterAPI';
import { useTheme } from '@/components/ThemeContext'; // Import ThemeContext
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Snackbar,
  Box,
  Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUser } from '@/components/authenticate';

export default function NewsletterIndex() {
  const user = useUser();
  const { darkMode, colorblindMode } = useTheme(); // Access dark mode and colorblind mode
  const [newsletters, setNewsletters] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const newslettersPerPage = 5; // Adjust this value for the number of newsletters per page
  const [handMode, setHandMode] = useState('none'); // State for hand mode

  // Load hand mode from localStorage
  useEffect(() => {
    const storedHandMode = localStorage.getItem('handMode') || 'none';
    setHandMode(storedHandMode);
  }, []);

  // Define original and colorblind-friendly button colors
  const buttonColors = {
    original: {
      primary: '#3498db',
      secondary: '#2ecc71',
      danger: '#e74c3c',
    },
    'red-green': {
      primary: '#1976d2', // Replace red with blue shades
      secondary: '#ff9800', // Replace green with orange shades
      danger: '#d32f2f', // Replace danger red with a neutral dark
    },
    'blue-yellow': {
      primary: '#e77f24', // Replace blue with orange
      secondary: '#3db48c', // Replace green with teal
      danger: '#c62828', // Replace danger red with neutral dark
    },
  };

  const colors = {
    ...buttonColors[colorblindMode] || buttonColors.original,
    textPrimary: darkMode ? '#f1f1f1' : '#2c3e50',
    textSecondary: darkMode ? '#d1d1d1' : '#7f8c8d',
    cardBackground: darkMode ? '#1e1e1e' : '#f9f9f9',
    containerBackground: darkMode ? '#121212' : '#f7f9fc',
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('User is not authenticated');
      return;
    }

    async function fetchNewsletters() {
      try {
        const newsletters = await getAllNewsletters(token, user.locationID); // Fetch newsletters with user's locationID
        const sortedNewsletters = newsletters.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNewsletters(sortedNewsletters);
      } catch (error) {
        setMessage(
          error.message === '404: No Newsletters currently'
            ? 'No newsletters found.'
            : `Error: ${error.message}`
        );
      } finally {
        setLoading(false);
      }
    }

    fetchNewsletters();
  }, [user]);

  // Calculate the newsletters to display on the current page
  const indexOfLastNewsletter = currentPage * newslettersPerPage;
  const indexOfFirstNewsletter = indexOfLastNewsletter - newslettersPerPage;
  const currentNewsletters = newsletters.slice(indexOfFirstNewsletter, indexOfLastNewsletter);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: colors.containerBackground,
          color: colors.textPrimary,
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: colors.containerBackground, minHeight: '100vh', py: 4 }}>
    <Container
      maxWidth="md"
      sx={{
        p: 3,
        backgroundColor: colors.containerBackground,
        borderRadius: 2,
        boxShadow: 3,
        mb: 4,
        overflow: 'hidden',
        color: colors.textPrimary,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: colors.textPrimary, mb: 3, fontSize: '2.5rem', fontWeight: 'bold' }}
      >
        Newsletters
      </Typography>

      {message && (
        <Snackbar
          open={Boolean(message)}
          autoHideDuration={6000}
          onClose={() => setMessage('')}
          message={message}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      )}

      {user && (user.accountType === 'Admin' || user.accountType === 'Staff') && (
        <Box
          textAlign={handMode === 'left' ? 'left' : handMode === 'right' ? 'right' : 'center'}
          sx={{ mt: 4 }}
        >
          <Button
            component={Link}
            href="/newsletter/create"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: colors.secondary,
              color: '#fff',
              '&:hover': { backgroundColor: colors.primary },
              textTransform: 'none',
              fontWeight: 'bold',
              width: '100%',
            }}
          >
            Create New Newsletter
          </Button>
        </Box>
      )}

      {newsletters.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mt: 3,
          }}
        >
          {currentNewsletters.map((newsletter) => (
            <Box key={newsletter.newsletterID}>
              <Card
                variant="outlined"
                sx={{
                  backgroundColor: colors.cardBackground,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                  },
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 'bold' }}>
                    {newsletter.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.textSecondary,
                      mt: 1,
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                    }}
                  >
                    {newsletter.content}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', color: colors.textSecondary }}>
                    {new Date(`${newsletter.createdAt}T00:00:00`).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{
                    pl: 2,
                    pb: 2,
                    justifyContent:
                      handMode === 'left'
                        ? 'flex-start'
                        : handMode === 'right'
                        ? 'flex-end'
                        : 'left',
                  }}
                >
                  <Link href={`/newsletter/${newsletter.newsletterID}`} passHref>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: colors.primary,
                        color: '#fff',
                        '&:hover': { backgroundColor: colors.primary },
                        textTransform: 'none',
                      }}
                    >
                      Expand
                    </Button>
                  </Link>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography
          variant="body2"
          align="center"
          sx={{ color: colors.textSecondary, fontSize: '1.2rem', mt: 3 }}
        >
          No newsletters found.
        </Typography>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
        <Pagination
          count={Math.ceil(newsletters.length / newslettersPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color={
            colorblindMode === 'blue-yellow' ? 'secondary' : 'primary' // Use "secondary" for blue-yellow mode
          }
        />
      </Box>
    </Container>
    </Box>
  );
}
