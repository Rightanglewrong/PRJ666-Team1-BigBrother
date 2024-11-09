import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    retrieveProgressReportByChildID,
    updateProgressReportInDynamoDB,
    deleteProgressReportFromDynamoDB,
} from "../../../utils/progressReportAPI"
import { useUser } from "@/components/authenticate";
import {
  Container,
  Typography,
  Box,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material"; 


export default function ViewProgressReportsPage() {
    const user = useUser();
    const router = useRouter();
    const [childID, setChildID] = useState("");
    const [childReports, setChildReports] = useState([]);
    const [message, setMessage] = useState("");
    const [updateReportTitle, setUpdateReportTitle] = useState("");
    const [updateReportContent, setUpdateReportContent] = useState("");
    const [updateFields, setUpdateFields] = useState(Array(5).fill(""));
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        if (router.query.childID) {
          setChildID(router.query.childID);  
        }
      }, [router.query.childID]);

    
        
    const fetchReportsByChildID = async () => { 
      if (childID) {
        try{
            const childReportData = await retrieveProgressReportByChildID(childID);
            setChildReports(childReportData)
        } catch (error) {
            setMessage(`Error fetching child reports: ${error.message}`);
        }
      };        
    };

    useEffect(() => {
      fetchReportsByChildID();
    }, [childID]);
       

    const parseReportContent = (content) => {
      if (content && typeof content === 'string') {
          const contentArray = content.split('|').map(item => item.trim()); // Trim extra spaces
          
          const [subject, progressTrend, comments, action] = contentArray;
  
          return (
              <div>
                  {subject && <div><strong>Subject:</strong> {subject}</div>}
                  {progressTrend && <div><strong>Progress Trend:</strong> {progressTrend}</div>}
                  {comments && <div><strong>Comments:</strong> {comments}</div>}
                  {action && <div><strong>Action:</strong> {action}</div>}
              </div>
          );
      }
      return null;
  };

    const handleSelectReport = (report) => {
      setSelectedReport(report);
      setUpdateReportTitle(report.reportTitle);

      // Parse and set update fields
      const contentArray = report.content.split('|').map(item => item.trim());
      if (contentArray.length > 1) {
          setUpdateFields(contentArray);
      } else {
          setUpdateReportContent(report.content); // Regular content as a single string
      }
  };

  const handleUpdate = async () => {
    if (selectedReport) {
        try {
            const updatedContent = updateFields.some(field => field)
                ? updateFields.filter(Boolean).join(" | ")
                : updateReportContent;

            const updateData = {
                reportTitle: updateReportTitle,
                content: updatedContent
            }

            const result = await updateProgressReportInDynamoDB(selectedReport.progressReportID, updateData);
            setMessage("Progress report updated successfully.");
            setSelectedReport(null);
            setUpdateReportTitle("");
            setUpdateReportContent("");
            setUpdateFields(Array(4).fill("")); // Reset fields
            fetchReportsByChildID(); // Refresh reports
        } catch (error) {
            setMessage(`Error updating report: ${error.message}`);
        }
    }
};

  const handleDeleteClick = (reportID) => {
    setSelectedReport(reportID);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedReport) {
        try {
            await deleteProgressReportFromDynamoDB(selectedReport);
            setMessage("Progress report deleted successfully.");
            setSelectedReport(null);
            setShowDeleteDialog(false);
            fetchReportsByChildID(); // Refresh reports
        } catch (error) {
            setMessage(`Error deleting report: ${error.message}`);
        }
    }
  };

  const handleCancelUpdate = () => {
    setSelectedReport(null);
    setUpdateReportTitle("");
    setUpdateReportContent("");
    setUpdateFields(Array(4).fill(""));
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setSelectedReport(null);
  };

  const handleBack = () => {
    router.back(); // Navigate to the previous page
  };

  function getFieldLabel(index) {
    const labels = ["Subject", "Progress Trend", "Details", "Suggestions"];
    return labels[index] || `Field ${index + 1}`; // Default to `Field X` if index is out of range
  }

  return (
    <Container>
        <Typography variant="h4" gutterBottom>Progress Reports</Typography>
        {message && (
            <Snackbar open autoHideDuration={6000} onClose={() => setMessage("")}>
                <Alert onClose={() => setMessage("")} severity="success">
                    {message}
                </Alert>
            </Snackbar>
        )}
        <Box>
        {childReports.length > 0 ? (
            childReports.map(report => (
              <Box key={report.progressReportID} mb={2}>
                <Typography variant="h6">{report.reportTitle}</Typography>
                <Typography variant="body1">
                {parseReportContent(report.content)}
                </Typography>
                <Button onClick={() => handleSelectReport(report)} variant="outlined" color="primary" sx={{ mt: 1, mr: 1 }}>
                    Update
                </Button>
                <Button onClick={() => handleDeleteClick(report.progressReportID)} variant="outlined" color="error" sx={{ mt: 1 }}>
                    Delete
                </Button>
              </Box>
            ))
        ) : (
          <Typography>No reports found for this child.</Typography>
        )}
        </Box>

        {selectedReport && (
            <Box mt={3}>
                <Typography variant="h5">Update Progress Report</Typography>
                <TextField
                    label="Report Title"
                    fullWidth
                    margin="normal"
                    value={updateReportTitle}
                    onChange={(e) => setUpdateReportTitle(e.target.value)}
                />
                {updateFields.some(field => field) ? (
                    // Render individual fields if `|`-separated content was found
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
                    // Render single content field otherwise
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
                <Button onClick={handleUpdate} variant="contained" color="primary" sx={{ mt: 2, mr: 2 }}>
                    Save Changes
                </Button>

                <Button onClick={handleCancelUpdate} variant="outlined" color="secondary"   sx={{ mt: 2 }}>
                          Cancel Update
                </Button>
                </Box>
            </Box>
        )}

        <Dialog
            open={showDeleteDialog}
            onClose={handleDeleteCancel}
        >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this progress report? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDeleteCancel} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleDeleteConfirm} color="error">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
        <div>
        <Button variant="contained" onClick={handleBack}  sx={{ mt: 4}}>
                Return to Previous Page
        </Button>
        </div>
    </Container>
  );
}




