import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  updateUserInDynamoDB,
  deleteUserInDynamoDB,
  getUsersByAccountTypeAndLocation,
} from '../../utils/userAPI';
import { getCurrentUser } from '@/utils/api';
import {
  Container,
  Typography,
  Box,
  Snackbar,
  Alert,
  Button,
  TextField,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { addContact, fetchContacts, updateContact, deleteContact } from '@/utils/contactApi'; // Import contact-related APIs
import ConfirmationModal from '@/components/Modal/ConfirmationModal';
import ErrorModal from '@/components/Modal/ErrorModal';

const AdminUserService = () => {
  const router = useRouter();
  const [userID, setUserID] = useState('');
  const [accountType, setAccountType] = useState('');
  const [locationID, setLocationID] = useState('');
  const [updateData, setUpdateData] = useState({
    firstName: '',
    lastName: '',
    accountType: '',
    accStatus: '',
  });
  const [usersList, setUsersList] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [result, setResult] = useState(null);

  // Error Modal
  const [error, setError] = useState(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  // Delete modal
  const [openDeleteConfirmationDialog, setOpenDeleteConfirmationDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [userToViewContacts, setUserToViewContacts] = useState(null);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    relationship: '',
    address: '',
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await getCurrentUser();
        setIsAdmin(currentUser.accountType === 'Admin');
      } catch (error) {
        showError('Error verifying Admin Status');
      }
    };
    checkAdmin();
  }, []);

  const showError = (message) => {
    setError(message);
    setErrorModalOpen(true);
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
  };

  const handleUpdateUser = async () => {
    try {
      const response = await updateUserInDynamoDB(userID, updateData);
      setResult(response.message);
      setError(null);
      await handleGetUsersByAccountTypeAndLocation();
    } catch (error) {
      showError('Error Updating User');
    }
  };

  const handleDeleteUser = async () => {
    if (updateData.accountType === 'Admin') {
      showError('Cannot delete an Admin user.');
      return;
    }
    setOpenDeleteConfirmationDialog(true);
    setUserToDelete(userID);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const response = await deleteUserInDynamoDB(userToDelete);
      setResult(response.message);
      setError(null);
      await handleGetUsersByAccountTypeAndLocation();
      setOpenDeleteConfirmationDialog(false);
      setUserID(null);
      setIsDeleting(false);
    } catch (error) {
      showError('Error deleting user.');
    }
  };

  const handleGetUsersByAccountTypeAndLocation = async () => {
    try {
      let users = [];

      if (!accountType) {
        const accountTypes = ['Admin', 'Staff', 'Parent'];
        const promises = accountTypes.map((type) =>
          getUsersByAccountTypeAndLocation(type, locationID)
        );
        const responses = await Promise.all(promises);

        responses.forEach((response) => {
          if (response.status === 'ok' && response.users) {
            users = users.concat(response.users);
          }
        });
      } else {
        const response = await getUsersByAccountTypeAndLocation(accountType, locationID);
        if (response.status === 'ok' && response.users) {
          users = response.users;
        }
      }

      if (users.length > 0) {
        setUsersList(users);
        setError(null);
      } else {
        showError('No users found for selected location');
      }

      setUpdateData({
        firstName: '',
        lastName: '',
        email: '',
        locationID: '',
        accountType: '',
        accStatus: '',
      });
      setUserID(null);
    } catch (error) {
      showError('Failed to retrieve users.');
    }
  };

  const handleUserSelect = (user) => {
    setUserID(user.userID);
    setUpdateData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      locationID: user.locationID,
      accountType: user.accountType,
      accStatus: user.accStatus,
    });
  };

  const handleDialogClose = () => {
    setOpenDeleteConfirmationDialog(false); // Close dialog if user cancels
    setUserToDelete(null); // Reset the user to delete
  };

  const handleViewContacts = async (user) => {
    try {
      const fetchedContacts = await fetchContacts(user.userID);
      setContacts(fetchedContacts || []); // Ensure contacts is always an array
      setUserToViewContacts(user);
      setIsContactModalOpen(true);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]); // Set contacts to an empty array if there's an error
      setUserToViewContacts(user); // Still show the dialog with an empty list
      setIsContactModalOpen(true); // Open the modal even if there are no contacts
    }
  };

  const resetContactForm = () => {
    setContactToEdit(null);
    setNewContact({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      relationship: '',
      address: '',
    });
  };

  const handleDeleteContact = async (contactID) => {
    try {
      await deleteContact(contactID);
      const updatedContacts = await fetchContacts(userToViewContacts.userID);
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error deleting contact:', error);
      showError('Failed to delete contact. Please try again.');
    }
  };

  const handleSaveContact = async () => {
    try {
      if (contactToEdit) {
        await updateContact(contactToEdit.contactID, newContact);
      } else {
        await addContact(userToViewContacts.userID, newContact);
      }
      const updatedContacts = await fetchContacts(userToViewContacts.userID);
      setContacts(updatedContacts);
      resetContactForm();
      setIsAdding(false); // Close the Add/Edit Contact Form
    } catch (error) {
      console.error('Error saving contact:', error);
      showError('Failed to save contact. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Get Users by Account Type and Location</Typography>
        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Account Type</InputLabel>{' '}
            <Select
              label="Account Type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              fullWidth
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Parent">Parent</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Location ID"
            variant="outlined"
            value={locationID}
            onChange={(e) => setLocationID(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleGetUsersByAccountTypeAndLocation}
          >
            Get Users
          </Button>
        </Box>
      </Box>

      {/* Error Modal */}
      <ErrorModal open={errorModalOpen} onClose={closeErrorModal} errorMessage={error} />

      {/* Confirmation Dialog */}
      <Dialog open={openDeleteConfirmationDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the user{' '}
          <strong>
            {userToDelete?.firstName} {userToDelete?.lastName}
          </strong>
          ?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{`Contacts for ${userToViewContacts?.firstName} ${userToViewContacts?.lastName}`}</DialogTitle>
        <DialogContent>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <Card
                key={contact.contactID}
                variant="outlined"
                sx={{
                  my: 2,
                  backgroundColor: '#f9f9f9',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {`${contact.firstName} ${contact.lastName}`}
                  </Typography>
                  <Typography>Phone: {contact.phoneNumber}</Typography>
                  <Typography>Relationship: {contact.relationship}</Typography>
                  <Typography>Address: {contact.address}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setIsAdding(true);
                      setContactToEdit(contact);
                      setNewContact(contact);
                    }}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteContact(contact.contactID)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" align="center">
              No contacts available for this user. Add one using the Add Contact button below.
            </Typography>
          )}
          {/* Add/Edit Contact Form */}
          {isAdding && (
            <Box component="form" my={3} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="First Name"
                value={newContact.firstName}
                onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                required
              />
              <TextField
                label="Last Name"
                value={newContact.lastName}
                onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                required
              />
              <TextField
                label="Phone Number"
                value={newContact.phoneNumber}
                onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                required
              />
              <TextField
                label="Relationship"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              />
              <TextField
                label="Address"
                value={newContact.address}
                onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
              />
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="contained" color="primary" onClick={handleSaveContact}>
                  {contactToEdit ? 'Update Contact' : 'Add Contact'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsAdding(false);
                    resetContactForm();
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
          {!isAdding && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setIsAdding(true);
                resetContactForm();
              }}
            >
              Add Contact
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsContactModalOpen(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">User List</Typography>
        <Paper elevation={2} sx={{ maxHeight: 300, overflow: 'auto', mt: 2, p: 2 }}>
          {usersList.length > 0 ? (
            <List>
              {usersList.map((user) => (
                <ListItem
                  key={user.userID}
                  selected={userID === user.userID}
                  onClick={() => handleUserSelect(user)}
                  sx={{
                    backgroundColor:
                      userID === user.userID ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 255, 0.1)' },
                    cursor: 'pointer',
                  }}
                >
                  <ListItemText
                    primary={
                      <>
                        <Typography variant="body1" component="span">
                          {`${user.firstName} ${user.lastName}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="div">
                          {user.email}
                        </Typography>
                      </>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" color="textSecondary" component="span">
                          {user.accountType}
                        </Typography>
                      </>
                    }
                  />
                  <Button
                    color="info"
                    onClick={() => handleViewContacts(user)}
                    sx={{ marginRight: 1 }}
                  >
                    View Contacts
                  </Button>
                  <Button
                    color="secondary"
                    onClick={() => {
                      handleUserSelect(user);
                      setIsDeleting(false);
                    }}
                    sx={{ marginRight: 1 }}
                  >
                    Update
                  </Button>
                  <Button
                    color="error"
                    onClick={() => {
                      setIsDeleting(true);
                      handleDeleteUser(user);
                    }}
                  >
                    Delete
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No users found
            </Typography>
          )}
        </Paper>
      </Box>

      {isAdmin && userID && !isDeleting && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Update User</Typography>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <TextField
                disabled={updateData.accountType === 'Admin'}
                label="First Name"
                variant="outlined"
                value={updateData.firstName}
                onChange={(e) =>
                  setUpdateData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                disabled={updateData.accountType === 'Admin'}
                label="Last Name"
                variant="outlined"
                value={updateData.lastName}
                onChange={(e) =>
                  setUpdateData((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                fullWidth
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Account Type</InputLabel>
                <Select
                  disabled={updateData.accountType === 'Admin'} // Disable if the accountType is Admin
                  label="Account Type"
                  value={updateData.accountType}
                  onChange={(e) =>
                    setUpdateData((prev) => ({
                      ...prev,
                      accountType: e.target.value,
                    }))
                  }
                  fullWidth
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
                  <MenuItem value="Parent">Parent</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Account Status"
                variant="outlined"
                value={updateData.accStatus}
                disabled // Disable to make it read-only
                fullWidth
              />
              <Button variant="contained" color="secondary" onClick={handleUpdateUser}>
                Update User
              </Button>
              <Button
                variant="outlined"
                color="default"
                onClick={() => setUserID(null)}
                style={{ marginTop: '10px' }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </>
      )}

      <Button
        variant="outlined"
        color="primary"
        onClick={() => router.push('/admin')} // Navigates to the admin page
        sx={{ textTransform: 'none', mt: 2 }}
      >
        Back to Admin
      </Button>

      {result && (
        <Snackbar open={true} autoHideDuration={6000} onClose={() => setResult(null)}>
          <Alert onClose={() => setResult(null)} severity="success" sx={{ width: '100%' }}>
            {result}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default AdminUserService;
