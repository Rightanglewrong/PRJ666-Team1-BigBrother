// src/pages/admin/progressReport/[id]
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { retrieveProgressReportByChildID } from '../utils/progressReportAPI';
import { retrieveChildProfileByID, retrieveChildrenByLocationID } from '../utils/childAPI';
import { getRelationshipByParentID } from '../utils/relationshipAPI';
import { getCurrentUser } from '../utils/api';
import { Container, Typography, Box, Divider, Snackbar } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Button } from '@mui/material';
import ProgressReportCard from '@/components/Card/ProgressReportCard';

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
    <Container>
      <Typography variant="h3" mt={2} align="center" gutterBottom>
        Progress Reports
      </Typography>
      <Divider />
      <Typography variant="body1" gutterBottom>
        {message}
      </Typography>

      <Box>
        {selectedChildID ? (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" gutterBottom>
                Progress Reports for {currentChildProfile.firstName} {currentChildProfile.lastName}
              </Typography>

              {userDetails?.accountType === 'Staff' && (
                <Button variant="contained" color="primary" onClick={handleCreateReportClick}>
                  Create Progress Report
                </Button>
              )}
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
                <Typography variant="h4">{selectedReport.reportTitle}</Typography>
                <Typography variant="body1">{selectedReport.content}</Typography>
                <Typography variant="caption">
                  <em>Created by: {selectedReport.createdBy}</em> on {selectedReport.datePosted}
                </Typography>
              </Box>
            )}

            <Box mt={2}>
              <Button variant="contained" onClick={handleReset} sx={{ marginRight: 2 }}>
                Return to Child Profiles
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" gutterBottom>
              Select a Child Profile
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Birth Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {childProfiles.map((child) => (
                    <TableRow key={child.childID}>
                      <TableCell>{child.firstName}</TableCell>
                      <TableCell>{child.lastName}</TableCell>
                      <TableCell>{child.age}</TableCell>
                      <TableCell>{child.birthDate}</TableCell>
                      <TableCell>
                        <Button variant="outlined" onClick={() => handleChildClick(child.childID)}>
                          View Progress Reports
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
  );
}
