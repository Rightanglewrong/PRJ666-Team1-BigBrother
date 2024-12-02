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

export default function ProgressReportLanding() {
  const router = useRouter();
  const user = useUser();
  const [childID, setChildID] = useState('');
  const [message, setMessage] = useState('');
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          onChange={(e) => {
            setChildID(e.target.value);
          }}
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
  );
}
