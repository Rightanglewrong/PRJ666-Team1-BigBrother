import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { retrieveChildrenByLocationID } from '../../../utils/childAPI';
import { useUser } from '@/components/authenticate';
import { generateSuggestions } from '@/utils/suggestionsAPI';
import {
  Container,
  Typography,
  Select,
  Button,
  Alert,
  Box,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import SendWeeklyReports from '@/components/weeklyReportSender';
import SnackbarNotification from '@/components/Modal/SnackBar';
import { useTheme } from '@/components/ThemeContext';

export default function ProgressReportLanding() {
  const router = useRouter();
  const user = useUser();
  const { darkMode, colorblindMode } = useTheme();
  const [childID, setChildID] = useState('');
  const [message, setMessage] = useState('');
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [handMode, setHandMode] = useState('none');

  const buttonColors = {
    primary: colorblindMode === 'blue-yellow' ? '#6a0dad' : '#1976d2',
    secondary: colorblindMode === 'blue-yellow' ? '#e77f24' : '#f44336',
    hoverPrimary: colorblindMode === 'blue-yellow' ? '#580c91' : '#1565c0',
    hoverSecondary: colorblindMode === 'blue-yellow' ? '#cc6f1f' : '#d32f2f',
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          localStorage.removeItem('token');
          router.push('/login');
          throw new Error('Unauthorized - please log in again.');
        }

        const children = await retrieveChildrenByLocationID(user.locationID);

        setChildProfiles(children || []);
        setMessage('');
      } catch (error) {
        if (error.message.includes('Unauthorized')) {
          setMessage('Session expired. Redirecting to login...');
          localStorage.removeItem('token');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setMessage(error.message || 'Error fetching the children by location.');
        }
        setChildProfiles(null);
      }
    };
    fetchUserData();
  }, [user, router]);

  useEffect(() => {
    const child = childProfiles.find((child) => child.childID === childID);
    setSelectedChild(child || null);
  }, [childID, childProfiles]);

  const handleGenerateSuggestionReport = async () => {
    if (!childID) {
      setErrorMessage('Please select a child before proceeding.');
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const child = childProfiles.find((child) => child.childID === childID);
      if (!child) {
        setErrorMessage('Invalid child selected.');
        setSnackbarOpen(true);
        return;
      }

      const suggestions = await generateSuggestions(childID, child.age);

      router.push({
        pathname: '/admin/progressReport/create',
        query: {
          childID,
          suggestions: JSON.stringify(suggestions.suggestions),
        },
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to generate AI suggestion report.');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: darkMode ? '#121212' : '#f7f9fc',
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
        backgroundColor: darkMode ? '#1e1e1e' : '#FFEBEE',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: darkMode ? '#f1f1f1' : '#2c3e50', fontWeight: 'bold' }}
      >
        Progress Report Management
      </Typography>

      {message && (
        <Alert
        severity="info"
        onClose={() => setMessage('')}
        sx={{
          backgroundColor: darkMode ? '#2a2a2a' : undefined,
          color: darkMode ? '#f1f1f1' : undefined,
        }}
      >
          {message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Select
          value={childID}
          onChange={(e) => {
            setChildID(e.target.value);
          }}
          fullWidth
          displayEmpty
          required
          sx={{
            '& .MuiSelect-select': {
              color: darkMode ? '#f1f1f1' : '#333',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? '#444' : '#ccc',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? '#f1f1f1' : '#1976d2',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? '#f1f1f1' : '#1976d2',
            },
          }}
        >
          <MenuItem value="">
            <em>Select a child</em>
          </MenuItem>
          {Array.isArray(childProfiles) && childProfiles.length > 0 ? (
            childProfiles.map((child) => (
              <MenuItem key={child.childID} value={child.childID}>
                {child.firstName} {child.lastName}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No children available</MenuItem>
          )}
        </Select>

        <Button
          variant="contained"
          color="success"
          sx={{ textTransform: 'none' }}
          disabled={!childID}
        >
          <Link
            href={`/admin/progressReport/create?childID=${childID}`}
            passHref
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Create Progress Report
          </Link>
        </Button>

        <Button
          variant="contained"
          color="info"
          onClick={handleGenerateSuggestionReport}
          sx={{ textTransform: 'none' }}
          disabled={isLoading || !childID}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Generate AI Suggestion Report'}
        </Button>

        <Button
          variant="contained"
          color="success"
          sx={{ textTransform: 'none' }}
          disabled={!childID}
        >
          <Link
            href={{
              pathname: '/admin/progressReport/child',
              query: {
                childID,
                firstName: selectedChild?.firstName,
                lastName: selectedChild?.lastName,
              },
            }}
            passHref
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {selectedChild
              ? `View ${selectedChild.firstName} ${selectedChild.lastName}'s Progress Reports`
              : 'View Progress Reports'}
          </Link>
        </Button>
      </Box>

      {user?.accountType === 'Admin' && <SendWeeklyReports locationID={user.locationID} />}

      <Button
        variant="outlined"
        color="primary"
        onClick={() => router.push('/admin')}
        sx={{ textTransform: 'none', mt: 2 }}
      >
        Back to Admin
      </Button>

      <SnackbarNotification
        open={snackbarOpen}
        message={errorMessage}
        severity="error"
        onClose={handleSnackbarClose}
      />
    </Container>
    </Box>
  );
}
