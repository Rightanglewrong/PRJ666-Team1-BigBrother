// src/components/Card/ProgressReportCard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Collapse,
  Card,
  CardContent,
  IconButton,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  updateProgressReportInDynamoDB,
  deleteProgressReportFromDynamoDB,
} from '../../utils/progressReportAPI';
import SnackbarNotification from '@/components/Modal/SnackBar';
import ConfirmationModal from '@/components/Modal/ConfirmationModal';
import { retrieveUserByIDInDynamoDB } from '../../utils/userAPI';

const ProgressReportCard = ({ report, isAdmin, fetchReportsByChildID, childName }) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(report.reportTitle);
  const [editFields, setEditFields] = useState(
    report.content.split('|').map((item) => item.trim())
  );
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [creatorName, setCreatorName] = useState('');

  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const getCreatedName = async (creatorID) => {
    try {
      const user = await retrieveUserByIDInDynamoDB(creatorID); 
      if (user && user.user.user.firstName && user.user.user.lastName) {
        const fullName = `${user.user.user.firstName} ${user.user.user.lastName}`;
        setCreatorName(fullName); 
      } else {
        setCreatorName('Unknown User'); 
      }
    } catch (error) {
      setCreatorName('Error fetching name'); 
    }
  };

  useEffect(() => {
    if (report && report.createdBy) {
      getCreatedName(report.createdBy); 
    }
  }, [report]);

  const parseReportContent = (content) => {
    if (content && typeof content === 'string') {
      const contentArray = content.split('|').map((item) => item.trim());
      if (contentArray.length > 1) {
        const [subject] = contentArray;
        return subject ? (
          <Typography variant="body2" noWrap>
            <strong>Subject:</strong> {subject}
          </Typography>
        ) : null;
      }
      return (
        <Typography variant="body2" noWrap>
          {content}
        </Typography>
      );
    }
    return (
      <Typography variant="body2" noWrap>
        No content available.
      </Typography>
    );
  };

  const renderExpandedContent = () => {
    if (!report.content) return null;

    const contentArray = report.content.split('|').map((item) => item.trim());
    if (contentArray.length > 1) {
      const [subject, progressTrend, comments, action] = contentArray;
      return (
        <Box>
          {subject && (
            <Box>
              <Typography variant="subtitle1" sx={{ textDecoration: 'underline' }}>
                Subject
              </Typography>
              <Typography>{subject}</Typography>
            </Box>
          )}
          {progressTrend && (
            <Box mt={1}>
              <Typography variant="subtitle1" sx={{ textDecoration: 'underline' }}>
                Progress Trend
              </Typography>
              <Typography>{progressTrend}</Typography>
            </Box>
          )}
          {comments && (
            <Box mt={1}>
              <Typography variant="subtitle1" sx={{ textDecoration: 'underline' }}>
                Comments
              </Typography>
              <Typography>{comments}</Typography>
            </Box>
          )}
          {action && (
            <Box mt={1}>
              <Typography variant="subtitle1" sx={{ textDecoration: 'underline' }}>
                Action
              </Typography>
              <Typography>{action}</Typography>
            </Box>
          )}
        </Box>
      );
    }
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ textDecoration: 'underline' }}>
          Content
        </Typography>
        <Typography>{report.content}</Typography>
      </Box>
    );
  };

  const handleSave = async () => {
    const updatedContent = editFields.filter(Boolean).join(' | ');
    try {
      await updateProgressReportInDynamoDB(report.progressReportID, {
        reportTitle: editTitle,
        content: updatedContent,
      });
      setSnackbar({
        open: true,
        message: 'Progress report updated successfully.',
        severity: 'success',
      });
      setIsEditing(false);
      fetchReportsByChildID(); // Refresh reports
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error updating report: ${error.message}`,
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProgressReportFromDynamoDB(report.progressReportID);
      setSnackbar({
        open: true,
        message: 'Progress report deleted successfully.',
        severity: 'success',
      });
      fetchReportsByChildID(); // Refresh reports
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error deleting report: ${error.message}`,
        severity: 'error',
      });
    }
  };

  const handleFieldChange = (index, value) => {
    const updatedFields = [...editFields];
    updatedFields[index] = value;
    setEditFields(updatedFields);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'all 0.3s',
        width: 'calc(100% - 20px)',
        margin: '10px',
        cursor: 'pointer',
        backgroundColor: expanded ? '#f0f8ff' : '#ffffff',
      }}
    >
      <CardContent onClick={handleExpandClick}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {report.reportTitle}
          </Typography>
          <IconButton
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
        {!expanded && <Box>{parseReportContent(report.content)}</Box>}
        <Typography variant="body2" color="textSecondary">
          For: {childName}
        </Typography>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {isEditing ? (
            <Box>
              <TextField
                label="Report Title"
                fullWidth
                margin="normal"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              {editFields.length > 1 ? (
                editFields.map((field, index) => {
                  const fieldLabels = ['Subject', 'Progress Trend', 'Comments', 'Action'];
                  const label = fieldLabels[index] || `Field ${index + 1}`;
                  const isLargerField = index === 3 || index === 2; // Only "Action" gets special treatment

                  return (
                    <TextField
                      key={index}
                      label={label}
                      fullWidth
                      multiline={isLargerField}
                      value={field}
                      onChange={(e) => handleFieldChange(index, e.target.value)}
                      margin="normal"
                      slotProps={
                        isLargerField
                          ? {
                              input: {
                                style: {
                                  resize: 'vertical',
                                  overflow: 'scroll',
                                  minHeight: '100px',
                                },
                              },
                            }
                          : undefined
                      }
                    />
                  );
                })
              ) : (
                <TextField
                  label="Content"
                  fullWidth
                  multiline
                  rows={4}
                  value={editFields[0] || ''}
                  onChange={(e) => handleFieldChange(0, e.target.value)}
                  margin="normal"
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
              )}

              <Box mt={2} display="flex" gap={2}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              {renderExpandedContent()}
              <Box mt={2}>
                
                <Typography variant="subtitle1" sx={{ textDecoration: 'underline' }}>
                  Created By
                </Typography>
                <Typography>{creatorName}</Typography>
                <Box mt={2}/>
                <Typography variant="subtitle1" sx={{ textDecoration: 'underline' }}>
                  Date Posted
                </Typography>
                <Typography>{report.datePosted}</Typography>
              </Box>
              {isAdmin && (
                <Box mt={2} display="flex" gap={2}>
                  <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setDeleteConfirmationOpen(true)}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Collapse>
      <ConfirmationModal
        open={deleteConfirmationOpen}
        title="Confirm Delete"
        description="Are you sure you want to delete this progress report? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmationOpen(false)}
      />
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </Card>
  );
};

export default ProgressReportCard;
