import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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

export default function ProgressReportLanding() {
  const router = useRouter();
  const user = useUser();
  const [childID, setChildID] = useState('');
  const [message, setMessage] = useState('');
  const [childProfiles, setChildProfiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Find the currently selected child's name
  let selectedChild = null;

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
        selectedChild = childProfiles.find((child) => child.childID === childID);
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

  const handleCreateProgressReport = (e) => {
    e.preventDefault();
    if (!childID) {
      setErrorMessage('Please select a child before proceeding.');
      setSnackbarOpen(true);
      return;
    }
    setErrorMessage('');
    router.push(`/admin/progressReport/create?childID=${childID}`);
  };

  const handleViewProgressReports = (e) => {
    e.preventDefault();
    if (!childID) {
      setErrorMessage('Please select a child before proceeding.');
      setSnackbarOpen(true);
      return;
    }
    setErrorMessage('');
    router.push(`/admin/progressReport/child?childID=${childID}`);
  };

  const handleGenerateSuggestionReport = async () => {
    if (!childID) {
      setErrorMessage('Please select a child before proceeding.');
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true); // Start loading
    try {
      const selectedChild = childProfiles.find((child) => child.childID === childID);
      if (!selectedChild) {
        setErrorMessage('Invalid child selected.');
        setSnackbarOpen(true);
        setIsLoading(false); // Stop loading
        return;
      }

      const suggestions = await generateSuggestions(childID, selectedChild.age);

      // Redirect to the create page with suggestions as pre-filled data
      router.push({
        pathname: '/admin/progressReport/create',
        query: {
          childID,
          suggestions: JSON.stringify(suggestions.suggestions), // Pass suggestions as a query param
        },
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to generate AI suggestion report.');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 4,
        p: 3,
        backgroundColor: '#FFEBEE',
        borderRadius: 2,
        boxShadow: 3,
        mb: 4,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: '#2c3e50', fontWeight: 'bold' }}
      >
        Progress Report Management
      </Typography>

      {message && (
        <Alert severity="info" onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Select
          label="Select Child"
          value={childID}
          onChange={(e) => setChildID(e.target.value)}
          fullWidth
          displayEmpty
          required
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
          onClick={handleCreateProgressReport}
          component={Link}
          href={`/admin/progressReport/create?childID=${childID}`}
          sx={{ textTransform: 'none' }}
        >
          Create Progress Report
        </Button>

        <Button
          variant="contained"
          color="info"
          onClick={handleGenerateSuggestionReport}
          sx={{ textTransform: 'none' }}
          disabled={isLoading} // Disable the button while loading
        >
          {isLoading ? <CircularProgress size={24} /> : 'Generate AI Suggestion Report'}
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={handleViewProgressReports}
          component={Link}
          href={`/admin/progressReport/child?childID=${childID}`}
          sx={{ textTransform: 'none' }}
          disabled={!selectedChild} // Disable button if no child is selected
        >
          {selectedChild
            ? `View ${selectedChild.firstName} ${selectedChild.lastName}'s Progress Reports`
            : 'View Progress Reports'}
        </Button>
      </Box>

      {/* Show SendWeeklyReports only if the user is an admin */}
      {user?.accountType === 'Admin' && <SendWeeklyReports locationID={user.locationID} />}

      <Button
        variant="outlined"
        color="primary"
        onClick={() => router.push('/admin')}
        sx={{ textTransform: 'none', mt: 2 }}
      >
        Back to Admin
      </Button>

      {/* SnackbarNotification for error messages */}
      <SnackbarNotification
        open={snackbarOpen}
        message={errorMessage}
        severity="error"
        onClose={handleSnackbarClose}
      />
    </Container>
  );
}
