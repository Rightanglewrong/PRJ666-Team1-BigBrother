import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  retrieveProgressReportByChildID,
  updateProgressReportInDynamoDB,
  deleteProgressReportFromDynamoDB,
} from '../../../utils/progressReportAPI';
import { Container, Typography, Box, Button, TextField } from '@mui/material';
import SnackbarNotification from '@/components/Modal/SnackBar';
import ConfirmationModal from '@/components/Modal/ConfirmationModal';
import CustomCard from '@/components/Card/CustomCard';

export default function ViewProgressReportsPage() {
  const router = useRouter();
  const [childID, setChildID] = useState('');
  const [childReports, setChildReports] = useState([]);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [updateReportTitle, setUpdateReportTitle] = useState('');
  const [updateReportContent, setUpdateReportContent] = useState('');
  const [updateFields, setUpdateFields] = useState(Array(5).fill(''));
  const [selectedReportForUpdate, setSelectedReportForUpdate] = useState(null);
  const [selectedReportForDelete, setSelectedReportForDelete] = useState(null);

  useEffect(() => {
    if (router.query.childID) {
      setChildID(router.query.childID);
    }
  }, [router.query.childID]);

  const fetchReportsByChildID = useCallback(async () => {
    if (childID) {
      try {
        const childReportData = await retrieveProgressReportByChildID(childID);
        setChildReports(childReportData);
      } catch (error) {
        setErrorMessage(`Error fetching child reports: ${error.message}`);
        setSnackbarOpen(true);
      }
    }
  }, [childID]);

  useEffect(() => {
    fetchReportsByChildID();
  }, [fetchReportsByChildID, childID]);

  const parseReportContent = (content) => {
    if (content && typeof content === 'string') {
      const contentArray = content.split('|').map((item) => item.trim());
      const [subject, progressTrend, comments, action] = contentArray;

      return (
        <Box>
          {subject && <div><strong>Subject:</strong> {subject}</div>}
          {progressTrend && <div><strong>Progress Trend:</strong> {progressTrend}</div>}
          {comments && <div><strong>Comments:</strong> {comments}</div>}
          {action && <div><strong>Action:</strong> {action}</div>}
        </Box>
      );
    }
    return null;
  };

  const handleSelectReportForUpdate = (report) => {
    setSelectedReportForUpdate(report);
    setSelectedReportForDelete(null);
    setUpdateReportTitle(report.reportTitle);

    const contentArray = report.content.split('|').map((item) => item.trim());
    setUpdateFields(contentArray.length > 1 ? contentArray : []);
    setUpdateReportContent(contentArray.length > 1 ? '' : report.content);
  };

  const handleUpdate = async () => {
    if (selectedReportForUpdate) {
      try {
        const updatedContent = updateFields.some((field) => field)
          ? updateFields.filter(Boolean).join(' | ')
          : updateReportContent;

        const updateData = {
          reportTitle: updateReportTitle,
          content: updatedContent,
        };

        await updateProgressReportInDynamoDB(selectedReportForUpdate.progressReportID, updateData);
        setMessage('Progress report updated successfully.');
        setSnackbarOpen(true);
        setSelectedReportForUpdate(null);
        setUpdateReportTitle('');
        setUpdateReportContent('');
        setUpdateFields(Array(4).fill(''));
        fetchReportsByChildID();
      } catch (error) {
        setErrorMessage(`Error updating report: ${error.message}`);
        setSnackbarOpen(true);
      }
    }
  };

  const handleDeleteClick = (reportID) => {
    setSelectedReportForDelete(reportID);
  };

  const handleDeleteConfirm = async () => {
    if (selectedReportForDelete) {
      try {
        await deleteProgressReportFromDynamoDB(selectedReportForDelete);
        setMessage('Progress report deleted successfully.');
        setSnackbarOpen(true);
        setSelectedReportForDelete(null);
        fetchReportsByChildID();
      } catch (error) {
        setErrorMessage(`Error deleting report: ${error.message}`);
        setSnackbarOpen(true);
      }
    }
  };

  const handleCancelUpdate = () => {
    setSelectedReportForUpdate(null);
    setUpdateReportTitle('');
    setUpdateReportContent('');
    setUpdateFields(Array(4).fill(''));
  };

  const handleBack = () => {
    router.push('/admin/progressReport');
  };

  const getFieldLabel = (index) => {
    const labels = ['Subject', 'Progress Trend', 'Details', 'Suggestions'];
    return labels[index] || `Field ${index + 1}`;
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Progress Reports</Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {childReports.length > 0 ? (
          childReports.map((report) => (
            <Box key={report.progressReportID} flexBasis={{ xs: '100%', sm: '48%', md: '30%' }}>
              <CustomCard
                title={report.reportTitle}
                content={parseReportContent(report.content)}
                actions={
                  <>
                    <Button
                      onClick={() => handleSelectReportForUpdate(report)}
                      variant="outlined"
                      color="primary"
                    >
                      Update
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(report.progressReportID)}
                      variant="outlined"
                      color="error"
                    >
                      Delete
                    </Button>
                  </>
                }
              />
            </Box>
          ))
        ) : (
          <Typography>No reports found for this child.</Typography>
        )}
      </Box>

      {selectedReportForUpdate && (
        <Box mt={3}>
          <Typography variant="h5">Update Progress Report</Typography>
          <TextField
            label="Report Title"
            fullWidth
            margin="normal"
            value={updateReportTitle}
            onChange={(e) => setUpdateReportTitle(e.target.value)}
          />
          {updateFields.length > 0 ? (
            updateFields.map((field, index) => (
              <TextField
                key={index}
                label={getFieldLabel(index)}
                fullWidth
                margin="normal"
                value={field}
                onChange={(e) => {
                  const newFields = [...updateFields];
                  newFields[index] = e.target.value;
                  setUpdateFields(newFields);
                }}
              />
            ))
          ) : (
            <TextField
              label="Report Content"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={updateReportContent}
              onChange={(e) => setUpdateReportContent(e.target.value)}
            />
          )}
          <Box mt={2}>
            <Button onClick={handleUpdate} variant="contained" color="primary">Save Changes</Button>
            <Button onClick={handleCancelUpdate} variant="outlined" color="secondary" sx={{ ml: 2 }}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      <ConfirmationModal
        open={!!selectedReportForDelete}
        title="Confirm Delete"
        description="Are you sure you want to delete this progress report? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSelectedReportForDelete(null)}
      />

      <SnackbarNotification
        open={snackbarOpen}
        message={errorMessage || message}
        severity={errorMessage ? 'error' : 'success'}
        onClose={() => setSnackbarOpen(false)}
      />

      <Button variant="contained" onClick={handleBack} sx={{ mt: 4, marginBottom: 2 }}>Return to Previous Page</Button>
    </Container>
  );
}
