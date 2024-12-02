// src/pages/admin/progressReport/create.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createProgressReportInDynamoDB } from '../../../utils/progressReportAPI';
import { retrieveChildProfileByID } from '../../../utils/childAPI';
import { useUser } from '@/components/authenticate';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SnackbarNotification from '@/components/Modal/SnackBar';

export default function CreateProgressReportPage() {
  const router = useRouter();
  const user = useUser();

  const [childID, setChildID] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [message, setMessage] = useState('');
  const [childName, setChildName] = useState('');
  const [reportType, setReportType] = useState('simplified');
  const [subject, setSubject] = useState('');
  const [progressTrending, setProgressTrending] = useState('');
  const [details, setDetails] = useState('');
  const [recommendedActivity, setRecommendedActivity] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (user && !(user.accountType === 'Admin' || user.accountType === 'Staff')) {
      setErrorMessage(
        'You are not authorized to create progress reports. Redirecting to the homepage...'
      );
      localStorage.removeItem('token');
      setSnackbarOpen(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [user, router]);

  useEffect(() => {
    if (router.query.childID) {
      setChildID(router.query.childID);
    }
  }, [router.query.childID]);

  useEffect(() => {
    if (router.query.suggestions) {
      try {
        const suggestions = JSON.parse(router.query.suggestions);

        const formattedDetails =
          suggestions.length > 0
            ? "Based on the last two weeks of the child's progress reports, this is the activities that are recommended for further growth!"
            : '';

        const formattedRecommendedActivities = suggestions
          .map((s) => `${s.activity} - ${s.reason}`)
          .join('\n');

        // Update fields based on AI suggestions
        setDetails(formattedDetails);
        setRecommendedActivity(formattedRecommendedActivities);
        setSubject('AI Suggestions');
        setProgressTrending('AI Suggestions');
        setReportTitle('AI Suggested Activities');

        // Auto set report type to detailed
        setReportType('detailed');
      } catch (error) {
        console.error('Error parsing suggestions:', error);
      }
    }
  }, [router.query.suggestions]);

  useEffect(() => {
    if (childID) {
      const fetchChildProfile = async () => {
        try {
          const profile = await retrieveChildProfileByID(childID);
          const childData = profile.child.child;
          setChildName(`${childData.firstName} ${childData.lastName}`);
          setFirstName(childData.firstName);
          setLastName(childData.lastName);
        } catch (error) {
          setErrorMessage(`Error fetching child profile: ${error.message}`);
        }
      };
      fetchChildProfile();
    }
  }, [childID]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const createdBy = user.userID;

    if (!createdBy) {
      setErrorMessage('User is not authenticated.');
      localStorage.removeItem('token');
      return router.push('/login');
    }

    try {
      const content =
        reportType === 'detailed'
          ? `${subject} | ${progressTrending} | ${details} | ${recommendedActivity}`
          : reportContent;

      const newReport = {
        childID,
        reportTitle,
        content,
        createdBy,
        locationID: user.locationID,
      };
      await createProgressReportInDynamoDB(newReport);
      setMessage('Progress Report created successfully');
      if (user.accountType === 'Admin') {
        router.push({
          pathname: `/admin/progressReport/child`,
          query: { childID, firstName, lastName },
        });
      } else {
        router.push({
          pathname: `/progressReport/child`,
          query: { childID, firstName, lastName },
        }); // I CHANGED THIS JUSTIN
        // router.push(`/progressReport/child?childID=${childID}`);
      }
    } catch (error) {
      setErrorMessage(`Error creating Progress Report: ${error.message}`);
    }
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
        Create Progress Report
      </Typography>

      {message && (
        <SnackbarNotification
          open={Boolean(message)}
          message={message}
          severity="info"
          onClose={() => setMessage('')}
        />
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField label="Child Name" value={childName} required disabled />

        <FormControl fullWidth required>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            label="Report Type"
          >
            <MenuItem value="simplified">Simplified</MenuItem>
            <MenuItem value="detailed">Detailed</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Report Title"
          value={reportTitle}
          onChange={(e) => setReportTitle(e.target.value)}
          required
        />

        {reportType === 'detailed' ? (
          <>
            <TextField
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <TextField
              label="Progress Trending"
              value={progressTrending}
              onChange={(e) => setProgressTrending(e.target.value)}
              required
            />
            <TextField
              label="Details"
              multiline
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
            <TextField
              label="Recommended Activity for Improvement"
              multiline
              value={recommendedActivity}
              onChange={(e) => setRecommendedActivity(e.target.value)}
              required
              slotProps={{
                input: {
                  style: {
                    resize: 'vertical',
                    overflow: 'scroll',
                    minHeight: '100px',
                  },
                },
              }}
            />
          </>
        ) : (
          <TextField
            label="Content"
            multiline
            rows={4}
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            required
            slotProps={{
              input: {
                style: {
                  resize: 'vertical', // Enable vertical resizing
                  overflow: 'auto', // Handle overflow for large content
                  minHeight: '100px', // Minimum height
                  maxHeight: '500px', // Optional: Maximum height
                },
              },
            }}
          />
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#3498db',
            color: '#fff',
            '&:hover': { backgroundColor: '#2980b9' },
          }}
        >
          Create Progress Report
        </Button>

        <Button
          variant="outlined"
          fullWidth
          sx={{
            color: '#3498db',
            borderColor: '#3498db',
            '&:hover': { borderColor: '#2980b9', color: '#2980b9' },
          }}
          onClick={() => router.back()}
        >
          Previous Page
        </Button>
      </Box>

      <SnackbarNotification
        open={snackbarOpen}
        message={errorMessage}
        severity="error"
        onClose={handleSnackbarClose}
      />
    </Container>
  );
}
