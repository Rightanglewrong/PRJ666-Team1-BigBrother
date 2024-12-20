import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  getRelationshipByChildID,
  getRelationshipByParentID,
  updateRelationshipInDynamoDB,
  deleteRelationshipFromDynamoDB,
} from '../../../utils/relationshipAPI';
import {
  retrieveUserByIDInDynamoDB,
  getUsersByAccountTypeAndLocation,
} from '../../../utils/userAPI';
import { retrieveChildProfileByID, retrieveChildrenByLocationID } from '../../../utils/childAPI';
import { useUser } from '@/components/authenticate';
import { useTheme } from '@/components/ThemeContext'; // Import theme context
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  DialogContentText,
  Snackbar,
} from '@mui/material';
import { useCallback } from 'react';

export default function Relationships() {
  const router = useRouter();
  const user = useUser();
  const { id, type } = router.query; // `id` is the parentID or childID; `type` specifies "parent" or "child".
  const { darkMode, colorblindMode, handMode } = useTheme(); // Access theme modes
  const [relationships, setRelationships] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [entityName, setEntityName] = useState('');
  const [deleteRelation, setDeleteRelation] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingRelation, setEditingRelation] = useState(null);
  const [parentProfiles, setParentProfiles] = useState([]);
  const [childProfiles, setChildProfiles] = useState([]);

  // Define dynamic styles for modes
  const colors = {
    background: darkMode ? '#121212' : '#E3F2FD',
    cardBackground: darkMode ? '#1e1e1e' : '#fff',
    text: darkMode ? '#f1f1f1' : '#000',
    primary: darkMode ? '#64b5f6' : '#1976d2',
    secondary: darkMode ? '#81c784' : '#4caf50',
    alertError: darkMode ? '#ff5252' : '#d32f2f',
    alertText: darkMode ? '#ffab91' : '#000',
  };

  useEffect(() => {
    const fetchProfilesData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized - please log in again.');
        const parents = await getUsersByAccountTypeAndLocation('Parent', user.locationID);
        const children = await retrieveChildrenByLocationID(user.locationID);

        setParentProfiles(parents.users || []);
        setChildProfiles(children || []);
      } catch (error) {
        setErrorMessage('Error fetching profiles:', error);
        setShowSnackbar(true);
      }
    };

    fetchProfilesData();
  }, [user]);

  const fetchEntityName = useCallback(async () => {
    try {
      if (type === 'parent') {
        const parent = await retrieveUserByIDInDynamoDB(id);
        setEntityName(`${parent.user.user.firstName} ${parent.user.user.lastName}`);
      } else if (type === 'child') {
        const child = await retrieveChildProfileByID(id);
        setEntityName(`${child.child.child.firstName} ${child.child.child.lastName}`);
      }
    } catch (error) {
      setErrorMessage('Error loading entity name:', error);
      setShowSnackbar(true);
    }
  }, [id, type]);

  const fetchRelationships = useCallback(async () => {
    try {
      let data = [];
      if (type === 'parent') {
        data = await getRelationshipByParentID(id);
      } else if (type === 'child') {
        data = await getRelationshipByChildID(id);
      }

      if (!data || data.length === 0) {
        setRelationships([]); // Explicitly set an empty array if no data
        return [];
      }

      const enrichedRelationships = await Promise.all(
        data.map(async (relation) => {
          if (type === 'parent') {
            const child = await retrieveChildProfileByID(relation.childID);
            return {
              ...relation,
              title: `${child.child.child.firstName} ${child.child.child.lastName}`, // Child's name
              classID: `${child.child.child.classID}`,
            };
          } else if (type === 'child') {
            const parent = await retrieveUserByIDInDynamoDB(relation.parentID);
            const child = await retrieveChildProfileByID(relation.childID);
            return {
              ...relation,
              title: `${parent.user.user.firstName} ${parent.user.user.lastName}`, // Parent's name
            };
          }
          return relation;
        })
      );

      setRelationships(enrichedRelationships || []);
    } catch (error) {
      setErrorMessage('No relationships found. Please try again.');
    }
  }, [id, type]);

  useEffect(() => {
    if (id && type) {
      fetchEntityName();
      fetchRelationships();
    }
  }, [fetchEntityName, fetchRelationships, id, type]);

  const handleDeleteClick = (relationshipID) => {
    setDeleteRelation(relationshipID);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteRelation) {
      try {
        await deleteRelationshipFromDynamoDB(deleteRelation);
        setDeleteRelation('');
        setShowDeleteDialog(false);
        setRelationships((prevRelationships) =>
          prevRelationships.filter((relation) => relation.relationshipID !== deleteRelation)
        );
      } catch (error) {
        setErrorMessage(`Error deleting relationship: ${error.message}`);
        setShowSnackbar(true);
      }
    }
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setSelectedReportForDelete(null);
  };

  const handleUpdate = (relation) => {
    setEditingRelation({ ...relation });
  };

  const handleSaveUpdate = async () => {
    try {
      const existingRelationships = await getRelationshipByParentID(editingRelation.parentID);

      // Check if a relationship with the same childID already exists, excluding the current relationship being edited
      if (
        existingRelationships.some(
          (relationship) =>
            relationship.childID === editingRelation.childID &&
            relationship.relationshipID !== editingRelation.relationshipID // Exclude the current one
        )
      ) {
        setErrorMessage('A relationship between this Parent and Child already exists.');
        setShowSnackbar(true);
        return;
      }
      await updateRelationshipInDynamoDB(editingRelation.relationshipID, editingRelation);
      setEditingRelation(null);
      fetchRelationships();
    } catch (error) {
      setErrorMessage('Failed to update relationship. Please try again.');
      setShowSnackbar(true);
    }
  };

  const handleEditChange = (field, value) => {
    setEditingRelation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.background,
        minHeight: '100vh',
        py: { xs: 'none', sm: 4 },
        px: { xs: 'none', sm: 2 },
      }}
    >
      <Container
        maxWidth="md"
        sx={{ backgroundColor: colors.cardBackground, p: 3, borderRadius: 2 }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ color: colors.text, fontWeight: 'bold', mb: 3 }}
        >
          {`${entityName}'s Relationships`}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          {relationships.length > 0 ? (
            relationships.map((relation) => (
              <Card
                key={relation.relationshipID}
                sx={{
                  width: 300,
                  backgroundColor: colors.cardBackground,
                  boxShadow: 3,
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: colors.text, mb: 1 }}>
                    {relation.title || 'Relationship'}
                  </Typography>

                  {/* If the query is for a child, display parent's details */}
                  {type === 'child' ? (
                    <>
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        Child&apos;s Relation: {relation.childRelation || 'No relation available'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        Adult&apos;s Relation: {relation.parentRelation || 'No relation available'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        Email: {relation.email || 'No email available'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        Phone: {relation.phoneNumber || 'No phone available'}
                      </Typography>
                    </>
                  ) : (
                    <>
                      {/* Default for "parent" type, show child's relation */}
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        Class ID: {relation.classID || 'No class available'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        Adult&apos;s Relation: {relation.parentRelation || 'No relation available'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        Child&apos;s Relation: {relation.childRelation || 'No relation available'}
                      </Typography>
                    </>
                  )}
                </CardContent>
                <CardActions
                  sx={{
                    display: 'flex',
                    justifyContent: handMode === 'right' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Render buttons only if user.accountType is "Admin" */}
                  {user.accountType === 'Admin' && (
                    <>
                      {/* Update Button */}
                      <Button
                        size="small"
                        onClick={() => handleUpdate(relation)}
                        sx={{
                          color: colorblindMode === 'blue-yellow' ? '#e77f24' : colors.primary, // Adjusted for blue-yellow mode
                          '&:hover': {
                            backgroundColor:
                              colorblindMode === 'blue-yellow' ? '#3db48c' : colors.primary, // Adjusted for blue-yellow mode
                            color: '#fff',
                          },
                        }}
                      >
                        Update
                      </Button>

                      {/* Delete Button */}
                      <Button
                        size="small"
                        onClick={() => handleDeleteClick(relation.relationshipID)}
                        sx={{
                          color: colorblindMode === 'red-green' ? '#' : colors.alertError, // Adjust for red-green
                          '&:hover': {
                            backgroundColor:
                              colorblindMode === 'red-green' ? '#8c8c8c' : colors.alertError,
                            color: '#fff',
                          },
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: colors.text }}>
              No relationships found.
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: {
              xs: handMode === 'right' ? 'flex-end' : 'flex-start', // For mobile: align based on hand mode
              md: 'flex-start', // Default alignment for larger screens
            },
            mt: 3,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => router.push('/admin/relationship')}
            sx={{
              color: colorblindMode === 'blue-yellow' ? '#e77f24' : colors.primary, // Adjust for colorblind mode
              borderColor: colorblindMode === 'blue-yellow' ? '#e77f24' : colors.primary,
              '&:hover': {
                backgroundColor: colorblindMode === 'blue-yellow' ? '#3db48c' : colors.primary,
                color: '#fff',
              },
            }}
          >
            Back
          </Button>
        </Box>

        <Dialog
          open={!!editingRelation}
          onClose={() => setEditingRelation(null)}
          aria-labelledby="update-dialog-title"
          aria-describedby="update-dialog-description"
        >
          <DialogTitle id="update-dialog-title">Update Relationship</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <Select
                fullWidth
                value={editingRelation?.parentID || ''}
                onChange={(e) => handleEditChange('parentID', e.target.value)}
                displayEmpty
                sx={{ mb: 2 }}
              >
                <MenuItem value="" disabled>
                  Select Parent
                </MenuItem>
                {parentProfiles.map((parent) => (
                  <MenuItem key={parent.userID} value={parent.userID}>
                    {`${parent.firstName} ${parent.lastName}`}
                  </MenuItem>
                ))}
              </Select>
              <Select
                fullWidth
                value={editingRelation?.childID || ''}
                onChange={(e) => handleEditChange('childID', e.target.value)}
                displayEmpty
                sx={{ mb: 2 }}
              >
                <MenuItem value="" disabled>
                  Select Child
                </MenuItem>
                {childProfiles.map((child) => (
                  <MenuItem key={child.childID} value={child.childID}>
                    {`${child.firstName} ${child.lastName}`}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                fullWidth
                label="Parent Relation"
                value={editingRelation?.parentRelation || ''}
                onChange={(e) => handleEditChange('parentRelation', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Child Relation"
                value={editingRelation?.childRelation || ''}
                onChange={(e) => handleEditChange('childRelation', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={editingRelation?.phoneNumber || ''}
                onChange={(e) => handleEditChange('phoneNumber', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingRelation(null)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveUpdate} color="secondary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={showDeleteDialog}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete this relationship? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
