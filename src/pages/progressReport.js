// src/pages/admin/progressReport/[id]
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { retrieveProgressReportByChildID } from '../utils/progressReportAPI';
import { retrieveChildProfileByID, retrieveChildrenByLocationID } from '../utils/childAPI';
import { getRelationshipByParentID } from '../utils/relationshipAPI';
import { getCurrentUser } from '../utils/api';
import { Container, Typography, Box, Divider, Snackbar } from '@mui/material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Button,
} from '@mui/material';
import ProgressReportCard from '@/components/Card/ProgressReportCard';
import { useTheme } from '@/components/ThemeContext';

export default function ProgressReport() {
  const router = useRouter();
  const [childID, setChildID] = useState('');
  const [message, setMessage] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [userId, setUserId] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChildID, setSelectedChildID] = useState(null);
  const [filteredReports, setFilteredReports] = useState([]);
  const [currentChildProfile, setCurrentChildProfile] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const { darkMode, colorblindMode } = useTheme();

  // Define styles based on modes
  const baseColors = {
    background: darkMode ? '#121212' : '#fff',
    text: darkMode ? '#f1f1f1' : '#000',
    buttonPrimary: darkMode ? '#64b5f6' : '#1976d2',
    buttonSecondary: darkMode ? '#81c784' : '#4caf50',
    cardBackground: darkMode ? '#1e1e1e' : '#f5f5f5',
    tableHeader: darkMode ? '#424242' : '#e3f2fd',
    divider: darkMode ? '#616161' : '#e0e0e0',
  };

  const colorblindOverrides = {
    'red-green': {
      buttonPrimary: '#1976d2',
      buttonSecondary: '#e77f24',
      text: darkMode ? '#f1f1f1' : '#000',
    },
    'blue-yellow': {
      buttonPrimary: '#e77f24',
      buttonSecondary: '#3db48c',
      text: darkMode ? '#f1f1f1' : '#000',
    },
  };

  const colors = {
    ...baseColors,
    ...(colorblindMode !== 'none' ? colorblindOverrides[colorblindMode] : {}),
  };

  // Fetching user details and child profiles on component load
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getCurrentUser();
        setUserDetails(userData);
        if (userData) {
          setUserId(userData.userID);
          if (userData.accountType === 'Parent') {
            const relationshipData = await getRelationshipByParentID(userData.userID);
            const uniqueChildIDs = [
              ...new Set(relationshipData.map((relationship) => relationship.childID)),
            ];
            const childProfilesData = await fetchChildProfiles(uniqueChildIDs);
            setChildProfiles(childProfilesData);
          } else if (userData.accountType === 'Staff') {
            const childrenData = await retrieveChildrenByLocationID(userData.locationID);
            const uniqueChildIDs = [...new Set(childrenData.map((child) => child.childID))];
            const childProfilesData = await fetchChildProfiles(uniqueChildIDs);
            setChildProfiles(childProfilesData);
          }
        }
      } catch (error) {
        setErrorMessage('Failed to load user details. Please log in again.');
      }
    };
    fetchUserDetails();
  }, []);

  // Function to fetch child profiles by unique child IDs
  const fetchChildProfiles = async (uniqueChildIDs) => {
    try {
      const childProfileData = await Promise.all(
        uniqueChildIDs.map(async (id) => {
          try {
            const childData = await retrieveChildProfileByID(id);
            if (!childData) {
              return null;
            }
            const { childID, firstName, lastName, age, birthDate } = childData.child.child;
            return {
              childID,
              firstName,
              lastName,
              age,
              birthDate,
            };
          } catch (error) {
            throw error;
          }
        })
      );
      return childProfileData.filter((profile) => profile !== null);
    } catch (error) {
      setErrorMessage('Failed to fetch child profiles.');
    }
  };

  // Handling child profile click to load progress reports
  const handleChildClick = async (childID) => {
    setSelectedChildID(childID);
    setChildID(childID);

    try {
      const childData = await retrieveChildProfileByID(childID);
      setCurrentChildProfile(childData.child.child);
      console.log(currentChildProfile);
    } catch (error) {
      setMessage(`Error fetching child profile: ${error.message}`);
    }

    try {
      const reports = await retrieveProgressReportByChildID(childID);
      setFilteredReports(reports);
    } catch (error) {
      setMessage(`No Progress Reports Found!`);
    }
  };

  // Reset selected child and reports
  const handleReset = () => {
    setSelectedChildID(null);
    setFilteredReports([]);
    setChildID('');
    setMessage('');
    setSelectedReport(null);
  };

  // Handling progress report creation
  const handleCreateReportClick = () => {
    router.push(`/progressReport/create?childID=${selectedChildID}`);
  };

  // Handling selected report display
  const handleReportClick = (report) => {
    setSelectedReport(report);
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.background, // Apply background color for the entire page
        color: colors.text, // Apply text color
        minHeight: '100vh', // Ensure it covers the full viewport height
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start', // Align the content at the top
        py: 4, // Add vertical padding
      }}
    >
      <Container
        sx={{
          backgroundColor: colors.cardBackground, // Container-specific background
          color: colors.text, // Container-specific text color
          borderRadius: 2,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Optional shadow for emphasis
          p: 3, // Padding inside the container
        }}
      >
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold', color: colors.text }}
        >
          Progress Reports
        </Typography>
        <Divider sx={{ backgroundColor: colors.divider }} />
        <Typography variant="body1" gutterBottom sx={{ color: colors.text }}>
          {message}
        </Typography>

        <Box>
          {selectedChildID ? (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" gutterBottom sx={{ color: colors.text }}>
                  Progress Reports for {currentChildProfile.firstName}{' '}
                  {currentChildProfile.lastName}
                </Typography>

                
              </Box>
              <Box>
                {filteredReports.map((report) => (
                  <ProgressReportCard
                    key={report.progressReportID}
                    report={report}
                    handleReportClick={handleReportClick} // Pass the click handler for reports
                    childName={`${currentChildProfile.firstName} ${currentChildProfile.lastName}`} // Pass child's full name
                  />
                ))}
              </Box>

              {selectedReport && (
                <Box>
                  <Typography variant="h4" sx={{ color: colors.text }}>
                    {selectedReport.reportTitle}
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.text }}>
                    {selectedReport.content}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.text }}>
                    <em>Created by: {selectedReport.createdBy}</em> on {selectedReport.datePosted}
                  </Typography>
                </Box>
              )}

              <Box  mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  variant="contained"
                  onClick={handleReset}
                  sx={{
                    backgroundColor: colors.buttonSecondary,
                    color: '#fff',
                    '&:hover': { backgroundColor: colors.buttonPrimary },
                  }}
                >
                  Return to Child Profiles
                </Button>

                {userDetails?.accountType === 'Staff' && (
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: colors.buttonPrimary,
                      color: '#fff',
                      '&:hover': { backgroundColor: colors.buttonSecondary },
                    }}
                    onClick={handleCreateReportClick}
                  >
                    Create 
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ color: colors.text }}>
                Select a Child Profile
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: colors.tableHeader }}>
                    <TableRow>
                      <TableCell sx={{ color: colors.text }}>First Name</TableCell>
                      <TableCell sx={{ color: colors.text }}>Last Name</TableCell>
                      <TableCell sx={{ color: colors.text }}>Age</TableCell>
                      <TableCell sx={{ color: colors.text }}>Birth Date</TableCell>
                      <TableCell sx={{ color: colors.text, width: "286px" }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {childProfiles.map((child) => (
                      <TableRow key={child.childID}>
                        <TableCell sx={{ color: colors.text }}>{child.firstName}</TableCell>
                        <TableCell sx={{ color: colors.text }}>{child.lastName}</TableCell>
                        <TableCell sx={{ color: colors.text }}>{child.age}</TableCell>
                        <TableCell sx={{ color: colors.text }}>{child.birthDate}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            sx={{
                              color: colors.buttonPrimary,
                              borderColor: colors.buttonPrimary,
                              '&:hover': {
                                backgroundColor: colors.buttonSecondary,
                                color: '#fff',
                              },
                            }}
                            onClick={() => handleChildClick(child.childID)}
                          >
                            View 
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>

        <Snackbar
          open={errorMessage != null}
          message={errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage(null)}
        />
      </Container>
    </Box>
  );
}
