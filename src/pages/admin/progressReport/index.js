import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { retrieveChildrenByLocationID } from '../../../utils/childAPI';
import { useUser } from '@/components/authenticate';
import { Container, Typography, Select, Button, Alert, Box, MenuItem } from '@mui/material';
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

  // Find the currently selected child's name
  const selectedChild = childProfiles.find((child) => child.childID === childID);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
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
