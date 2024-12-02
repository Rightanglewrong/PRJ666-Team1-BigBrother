// src/pages/admin/progressReport/[id]
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { retrieveProgressReportByChildID } from '../../../utils/progressReportAPI';
import { useUser } from '@/components/authenticate';
import { Container, Typography, Box, Divider, Button, Pagination } from '@mui/material';
import SnackbarNotification from '@/components/Modal/SnackBar';
import ProgressReportCard from '@/components/Card/ProgressReportCard';

export default function ViewProgressReportsPage() {
  const user = useUser();
  const router = useRouter();
  const [childID, setChildID] = useState('');
  const [childName, setChildName] = useState(''); // Child's full name
  const [childReports, setChildReports] = useState([]);
  const [message, setMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const reportsPerPage = 5; // Reports per page
  const isAdmin = user.accountType === 'Admin';

  // Set the child ID and name from the router query
  useEffect(() => {
    if (router.query.childID) {
      setChildID(router.query.childID);
    }
    if (router.query.firstName && router.query.lastName) {
      setChildName(`${router.query.firstName} ${router.query.lastName}`);
    }
  }, [router.query]);

  // Fetch progress reports by child ID
  const fetchReportsByChildID = useCallback(async () => {
    if (childID) {
      try {
        const childReportData = await retrieveProgressReportByChildID(childID);
        if (childReportData && childReportData.length > 0) {
          // Sort reports by `datePosted` in descending order (newest first)
          const sortedReports = childReportData.sort(
            (a, b) => new Date(b.datePosted) - new Date(a.datePosted)
          );
          setChildReports(sortedReports);
        } else {
          setChildReports([]); // Handle cases where no reports are found
        }
      } catch (error) {
        setMessage(`Error fetching child reports: ${error.message}`);
        setSnackbarOpen(true);
      }
    }
  }, [childID]);

  // Fetch reports on initial load or when child ID changes
  useEffect(() => {
    fetchReportsByChildID();
  }, [fetchReportsByChildID, childID]);

  // Calculate paginated reports
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = childReports.slice(indexOfFirstReport, indexOfLastReport);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Container>
      <Typography variant="h3" align="center" mt={2} gutterBottom>
        Progress Reports for {childName || 'Child'}
      </Typography>
      <Divider />
      <Box display="flex" flexWrap="wrap" gap={2}>
        {currentReports.length > 0 ? (
          currentReports.map((report) => (
            <ProgressReportCard
              key={report.progressReportID}
              report={report}
              isAdmin={isAdmin}
              fetchReportsByChildID={fetchReportsByChildID} // Pass down the refresh function
              childName={childName} // Pass child's name to the card
            />
          ))
        ) : (
          <Typography>No progress reports found for {childName || 'this child'}.</Typography>
        )}
      </Box>

      {/* Pagination Component */}
      {childReports.length > reportsPerPage && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(childReports.length / reportsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <SnackbarNotification
        open={snackbarOpen}
        message={message}
        severity="error"
        onClose={() => setSnackbarOpen(false)}
      />

      <Button
        variant="contained"
        onClick={() => router.push('/admin/progressReport')}
        sx={{ mt: 4, marginBottom: 2 }}
      >
        Return to Admin
      </Button>
    </Container>
  );
}
