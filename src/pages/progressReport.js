import { useState, useEffect } from "react";
import { useRouter } from "next/router"
import {
  retrieveProgressReportByChildID,
} from "../utils/progressReportAPI";
import { retrieveChildProfileByID, retrieveChildrenByLocationID } from "../utils/childAPI";
import { getRelationshipByParentID } from "../utils/relationshipAPI";
import { getCurrentUser } from "../utils/api";
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"; 

export default function ProgressReport() {
  const router = useRouter();
  const [childID, setChildID] = useState("");
  const [message, setMessage] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [userId, setUserId] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChildID, setSelectedChildID] = useState(null);
  const [filteredReports, setFilteredReports] = useState([]);
  const [currentChildProfile, setCurrentChildProfile] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getCurrentUser();
        setUserDetails(userData);
        if (userData) {
          setUserId(userData.userID);
          if (userData.accountType === 'Parent') {
            const relationshipData = await getRelationshipByParentID(userData.userID);
            const uniqueChildIDs = [...new Set(relationshipData.map((relationship) => relationship.childID))];
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
        //console.error("Error fetching user data:", error);
        setErrorMessage("Failed to load user details. Please log in again.");
      }
    };
    fetchUserDetails();
  }, []);

  const fetchChildProfiles = async (uniqueChildIDs) => {
    try {
      const childProfileData = await Promise.all(
        uniqueChildIDs.map(async (id) => {
          try {
            const childData = await retrieveChildProfileByID(id);
            if (!childData) {
              //console.warn(`No data found for child with ID ${id}`);
              return null;
            }
            const { childID, firstName, lastName, age, birthDate, ...rest } = childData.child.child;
            return {
              childID,
              firstName,
              lastName,
              age,
              birthDate,
            };
          } catch (error) {
            //console.error(`Error retrieving data for child ${id}:`, error);
            throw error;
          }
        })
      );
      const validChildProfiles = childProfileData.filter(profile => profile !== null).flat();
      return validChildProfiles;
    } catch (error) {
      //console.error("Error fetching child profiles:", error);
      setErrorMessage("Failed to fetch child profiles.");
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleReset = () => {
    setSelectedChildID(null);
    setFilteredReports([]);
    setChildID("");
    setMessage("");
    setSelectedReport(null);
  };

  const handleChildClick = async (childID) => {
    setSelectedChildID(childID);
    setChildID(childID);

    try {
      const childData = await retrieveChildProfileByID(childID);
      setCurrentChildProfile(childData.child.child);
    } catch (error) {
      setMessage(`Error fetching child profile: ${error.message}`);
    }

    try {
      const reports = await retrieveProgressReportByChildID(childID);
      setFilteredReports(reports);
    } catch (error) {
      setMessage(`Error fetching progress reports: ${error.message}`);
    }
  };

  const handleCreateReportClick = () => {
    router.push(`/progressReport/create?childID=${selectedChildID}`);
  };

  const handleReportClick = (report) => {
    setSelectedReport(report); // Set selected report details
  };

  const parseReportContent = (content) => {
    if (content && typeof content === 'string') {
      if (content.includes('|')) {
      const contentArray = content.split('|').map(item => item.trim());
      const [subject, progressTrend, comments, action] = contentArray;

      return (
        <div>
          {subject && <div><strong>Subject:</strong> {subject}</div>}
          {progressTrend && <div><strong>Progress Trend:</strong> {progressTrend}</div>}
          {comments && <div><strong>Comments:</strong> {comments}</div>}
          {action && <div><strong>Action:</strong> {action}</div>}
        </div>
      );
    } else {
        return <Typography><strong>Content:</strong> {content}</Typography>;
    }
  }
    return null;
  }; 

  return (
    
    <Container>
      <Typography variant="h3" gutterBottom>
        Progress Reports
      </Typography>
      <Typography variant="body1" gutterBottom>
        {message}
      </Typography>

      <Box>
        {selectedChildID ? (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center"  mb={2}>
            <Typography variant="h5" gutterBottom>
              Progress Reports for {currentChildProfile.firstName} {currentChildProfile.lastName}
            </Typography>

            {userDetails?.accountType === "Staff" && (
              <Button variant="contained" color="primary" onClick={handleCreateReportClick}>
                Create Progress Report
              </Button> 
            )}
            </Box>
            <Box>
              {filteredReports.map((report) => (
                <Box
                  key={report.progressReportID}
                  onClick={() => handleReportClick(report)}
                  sx={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                    cursor: 'pointer',
                  }}
                >
                  <Typography variant="h6">{report.reportTitle}</Typography>
                  {parseReportContent(report.content)}
                  <Typography variant="caption">
                    <em>Created by: {report.createdBy}</em> on {report.datePosted}
                  </Typography>
                </Box>
              ))}
            </Box>

            {selectedReport && (
              <Box>
                <Typography variant="h4">{selectedReport.reportTitle}</Typography>
                {selectedReport.content.includes('|') ? (
                  <Box>{parseReportContent(selectedReport.content)}</Box>
                ) : (
                  <Typography variant="body1">{selectedReport.content}</Typography>
                )}
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

            <Box>
              {childProfiles.map((child) => (
                <Box key={child.childID} sx={{ marginBottom: 2 }}>
                  <Typography variant="h6">{child.firstName} {child.lastName}</Typography>
                  <Typography variant="body2"><strong>Age:</strong> {child.age}</Typography>
                  <Typography variant="body2"><strong>Birth Date:</strong> {child.birthDate}</Typography>
                  <Button
                    variant="outlined"
                    onClick={() => handleChildClick(child.childID)}
                  >
                    View Progress Reports
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {showErrorModal && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', width: '400px' }}>
            <Typography variant="h6" gutterBottom>Error</Typography>
            <Typography variant="body1">{errorMessage}</Typography>
            <Button variant="contained" color="primary" onClick={handleCloseErrorModal} sx={{ marginTop: '16px' }}>Close</Button>
          </Box>
        </Box>
      )}
    </Container>
  );
}

