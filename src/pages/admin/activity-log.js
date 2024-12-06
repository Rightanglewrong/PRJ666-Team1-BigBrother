// src/pages/admin/activity-log.js
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchLogsByLocation, fetchLogsByUser } from '../../utils/activityLogAPI';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  TextField,
} from '@mui/material';
import CustomButton from '../../components/Button/CustomButton';
import CustomInput from '../../../Input/CustomInput';
import styles from './ActivityLogPage.module.css';
import { useUser } from '@/components/authenticate';
import { useTheme } from '@/components/ThemeContext';

const getDateNDaysFromToday = (daysOffset) =>
  new Date(new Date().setDate(new Date().getDate() + daysOffset)).toISOString().split('T')[0];

const ActivityLogPage = () => {
  const user = useUser();
  const { darkMode, colorblindMode } = useTheme();
  const [logs, setLogs] = useState([]);
  const [searchType, setSearchType] = useState('email');
  const [locationID, setLocationID] = useState(user.locationID);
  const [email, setEmail] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [startDate, setStartDate] = useState(getDateNDaysFromToday(-7));
  const [endDate, setEndDate] = useState(getDateNDaysFromToday(1));
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchLogs = async () => {
    try {
      const formattedStartDate = new Date(startDate).toISOString();
      const formattedEndDate = new Date(endDate).toISOString();
      const logsData =
        searchType === 'email'
          ? await fetchLogsByUser(email, formattedStartDate, formattedEndDate, limit)
          : await fetchLogsByLocation(locationID, formattedStartDate, formattedEndDate, limit);

      setLogs(logsData);
      setError('');
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        setError('Unauthorized access. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000); // Redirect after 2 seconds
      } else {
        //console.error("Error fetching activity logs:", err);
        setError('Failed to retrieve activity logs. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (!user) {
      setError('Session expired. Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000); // Redirect after 2 seconds
    } else {
      setIsAuthorized(user.accountType === 'Admin');
    }
  }, [user, router]);

  const containerStyles = {
    backgroundColor: darkMode ? '#121212' : '#f7f9fc',
    color: darkMode ? '#f1f1f1' : '#333',
    minHeight: '100vh',
    padding: '20px',
  };

  const cardStyles = {
    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: darkMode ? '0 4px 8px rgba(255, 255, 255, 0.1)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
  };

  const buttonStyles = {
    primary: colorblindMode === 'blue-yellow' ? '#ff8c00' : colorblindMode === 'red-green' ? '#e77f24' : '#1976d2',
    primaryHover: colorblindMode === 'blue-yellow' ? '#ff7b00' : colorblindMode === 'red-green' ? '#cc6f1f' : '#1565c0',
    danger: colorblindMode === 'blue-yellow' ? '#c62828' : '#f44336',
  };

  const textStyles = {
    color: darkMode ? '#f1f1f1' : '#333',
  };

  if (isAuthorized === false) {
    return (
      <Typography
        variant="h4"
        align="center"
        color="error"
        sx={{ marginTop: 5, color: darkMode ? '#f44336' : '#d32f2f' }}
      >
        Unauthorized Access
      </Typography>
    );
  }

  if (isAuthorized === null) {
    return (
      <Typography
        variant="h4"
        align="center"
        color="info"
        sx={{ marginTop: 5, color: darkMode ? '#ffffff' : '#1976d2' }}
      >
        Loading...
      </Typography>
    );
  }

  return (
    <Box sx={containerStyles}>
      <Typography variant="h3" align="center" sx={{ fontWeight: 'bold', mb: 3, ...textStyles }}>
        Activity Log
      </Typography>

      <Box sx={{ ...cardStyles, mb: 3 }}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel
            component="legend"
            sx={{ fontWeight: 'bold', mb: 2, color: darkMode ? '#ffffff' : '#1976d2' }}
          >
            Search By
          </FormLabel>
          <RadioGroup
            row
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            sx={{ display: 'flex', gap: 2 }}
          >
            <FormControlLabel
              value="location"
              control={<Radio sx={{ color: textStyles.color }} />}
              label="Location ID"
              sx={textStyles}
            />
            <FormControlLabel
              value="email"
              control={<Radio sx={{ color: textStyles.color }} />}
              label="Email"
              sx={textStyles}
            />
          </RadioGroup>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          {searchType === 'location' ? (
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Location ID"
                value={locationID}
                onChange={(e) => setLocationID(e.target.value)}
                fullWidth
                disabled
                variant="outlined"
                sx={{ '& .MuiInputBase-input': { color: textStyles.color } }}
              />
            </Box>
          ) : (
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input': {
                    color: darkMode ? '#f1f1f1' : '#333', // Input text color
                    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', // Input background
                  },
                  '& .MuiInputLabel-root': {
                    color: darkMode ? '#f1f1f1' : '#333', // Label color
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? '#444' : '#ccc', // Outline color
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? '#f1f1f1' : '#1976d2', // Hover outline color
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? '#f1f1f1' : '#1976d2', // Focused outline color
                  },
                }}
              />
            </Box>
          )}

          <Box sx={{ flex: 1 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  color: darkMode ? '#f1f1f1' : '#333', // Input text color
                  backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', // Input background
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#f1f1f1' : '#333', // Label color
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#444' : '#ccc', // Outline color
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#f1f1f1' : '#1976d2', // Hover outline color
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#f1f1f1' : '#1976d2', // Focused outline color
                },
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  color: darkMode ? '#f1f1f1' : '#333', // Input text color
                  backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', // Input background
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#f1f1f1' : '#333', // Label color
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#444' : '#ccc', // Outline color
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#f1f1f1' : '#1976d2', // Hover outline color
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#f1f1f1' : '#1976d2', // Focused outline color
                },
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              label="Limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  color: darkMode ? '#f1f1f1' : '#333', // Input text color
                  backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', // Input background
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#f1f1f1' : '#333', // Label color
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#444' : '#ccc', // Outline color
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#f1f1f1' : '#1976d2', // Hover outline color
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#f1f1f1' : '#1976d2', // Focused outline color
                },
              }}
            />
          </Box>
          <Button
            variant="contained"
            sx={{
              backgroundColor: buttonStyles.primary,
              '&:hover': { backgroundColor: buttonStyles.primaryHover },
              mt: 1,
            }}
            onClick={fetchLogs}
          >
            Fetch Logs
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography variant="body1" sx={{ color: buttonStyles.danger, textAlign: 'center', mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: cardStyles.backgroundColor,
          borderRadius: '8px',
          boxShadow: cardStyles.boxShadow,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
            <TableCell sx={textStyles}>Activity Type</TableCell>
              <TableCell sx={textStyles}>Description</TableCell>
              <TableCell sx={textStyles}>User Email</TableCell>
              <TableCell sx={textStyles}>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={textStyles}>
                  No logs found for the specified criteria.
                </TableCell>
              </TableRow>
            ) : (
              Object.values(logs).map((log) => (
                <TableRow key={log.ID}>
                  <TableCell sx={textStyles}>{log.activityType}</TableCell>
                  <TableCell sx={textStyles}>{log.desc}</TableCell>
                  <TableCell sx={textStyles}>{log.userEmail}</TableCell>
                  <TableCell sx={textStyles}>{log.timestamp}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ActivityLogPage;
