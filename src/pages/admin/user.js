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
  Paper,
  FormControl,
  InputLabel,
} from '@mui/material';
import { addContact, fetchContacts, updateContact, deleteContact } from '@/utils/contactApi'; // Import contact-related APIs
import UserList from '@/components/List/UserList';
import ContactManagementModal from '@/components/Modal/ContactManagementModal';
import UpdateUserForm from '../../../Input/UpdateUserForm';

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

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // Delete modal
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
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
        showSnackbar('Error verifying Admin Status', 'error');
      }
    };
    checkAdmin();
  }, []);

  // Snackbar handler
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Update User Op
  const handleUpdateUser = async () => {
    try {
      const response = await updateUserInDynamoDB(userID, updateData);
      await handleGetUsersByAccountTypeAndLocation();
      showSnackbar('User updated successfully', 'success');
    } catch (error) {
      showSnackbar('Error updating user', 'error');
    }
  };

  // Delete User op
  const handleDeleteUser = async (user) => {
    try {
      // Fetch user details to ensure we have the latest accountType
      const fetchedUser = usersList.find((u) => u.userID === user.userID) || user;

      // Check if the user is an Admin
      if (fetchedUser.accountType === 'Admin') {
        showSnackbar('Cannot delete an Admin user.', 'error');
        setIsDeleting(false);
        return;
      }

      // Proceed with setting the user for deletion and showing the confirmation modal
      setUserToDelete(fetchedUser);
      setDeleteConfirmationModal(true);
    } catch (error) {
      showSnackbar('Error validating user details for deletion.', 'error');
      //console.error('Error in handleDeleteUser:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const response = await deleteUserInDynamoDB(userToDelete.userID);
      await handleGetUsersByAccountTypeAndLocation();
      setDeleteConfirmationModal(false);
      setUserID(null);
      setIsDeleting(false);
      showSnackbar('User deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Error deleting user.', 'error');
    }
  };

  const handleDeleteModalClose = () => {
    setDeleteConfirmationModal(false);
    setUserToDelete(null); // Reset the user to delete
  };

  // Users retrieval
  const handleGetUsersByAccountTypeAndLocation = async () => {
    try {
      let users = await fetchUsers(accountType, locationID);
      const current = await getCurrentUser();
      const filteredUsers = users.filter((user) => user.userID !== current.userID);

      if (users.length > 0) {
        setUsersList(filteredUsers);
      } else {
        showSnackbar('No users found for selected location', 'info');
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
      showSnackbar('Failed to retrieve users.', 'error');
    }
  };

  const fetchUsers = async (accountType, locationID) => {
    try {
      let users = [];
      if (!accountType) {
        users = await fetchUsersByLocation(locationID);
      } else {
        users = await fetchUsersByAccountTypeAndLocation(accountType, locationID);
      }

      return users;
    } catch (error) {
      //console.error('Failed to fetch users:', error);
      return [];
    }
  };

  const fetchUsersByAccountTypeAndLocation = async (accountType, locationID) => {
    try {
      const response = await getUsersByAccountTypeAndLocation(accountType, locationID);
      if (response.status === 'ok' && response.users) {
        return response.users;
      }
      return [];
    } catch (error) {
      //console.error('Failed to fetch users by account type and location:', error.message);
      return [];
    }
  };

  const fetchUsersByLocation = async (locationID) => {
    try {
      const admins = await fetchAdminUsers(locationID);
      const staff = await fetchStaffUsers(locationID);
      const parents = await fetchParentUsers(locationID);

      const results = admins.concat(staff, parents);
      return results;
    } catch (error) {
      //console.error('Failed to fetch users by location:', error);
      return [];
    }
  };

  const fetchAdminUsers = async (locationID) => {
    try {
      const response = await getUsersByAccountTypeAndLocation('Admin', locationID);
      if (response.status === 'ok' && Array.isArray(response.users) && response.users.length > 0) {
        return response.users;
      } else {
        return [];
      }
    } catch (error) {
      //console.error('Error fetching Admin users:', error);
      return [];
    }
  };

  const fetchStaffUsers = async (locationID) => {
    try {
      const response = await getUsersByAccountTypeAndLocation('Staff', locationID);
      if (response.status === 'ok' && Array.isArray(response.users) && response.users.length > 0) {
        return response.users;
      } else {
        return [];
      }
    } catch (error) {
      //console.error('Error fetching Staff users:', error);
      return [];
    }
  };

  const fetchParentUsers = async (locationID) => {
    try {
      const response = await getUsersByAccountTypeAndLocation('Parent', locationID);
      if (response.status === 'ok' && Array.isArray(response.users) && response.users.length > 0) {
        return response.users;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  // Handle the selection of users and populating of state data
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

  // COntact functionality
  const handleViewContacts = async (user) => {
    try {
      const fetchedContacts = await fetchContacts(user.userID);
      setContacts(fetchedContacts || []); // Ensure contacts is always an array
      setUserToViewContacts(user);
      setIsContactModalOpen(true);
    } catch (error) {
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

      if (!userToViewContacts?.userID) {
        //console.error('Invalid user context');
        throw new Error('User context is invalid.');
      }

      const updatedContacts = await fetchContacts(userToViewContacts.userID);
      setContacts(updatedContacts);
    } catch (error) {
      //console.error('Error deleting contact:', error);
      showSnackbar('Failed to delete contact. Please try again.', 'error');
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
      //console.error('Error saving contact:', error);
      showSnackbar('Failed to save contact. Please try again.', 'error');
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
              <MenuItem value={''}>All</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Parent">Parent</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Location ID"
            variant="outlined"
            value={locationID}
            onChange={(e) => setLocationID(e.target.value.toUpperCase())}
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

      <ContactManagementModal
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        user={userToViewContacts}
        contacts={contacts}
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        newContact={newContact}
        setNewContact={setNewContact}
        contactToEdit={contactToEdit}
        setContactToEdit={setContactToEdit}
        onSaveContact={handleSaveContact}
        onDeleteContact={handleDeleteContact}
        resetContactForm={resetContactForm}
      />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">User List</Typography>
        <Paper elevation={2} sx={{ maxHeight: 300, overflow: 'auto', mt: 2, p: 2 }}>
          <UserList
            users={usersList}
            selectedUserId={userID}
            onSelect={handleUserSelect}
            onViewContacts={handleViewContacts}
            onDelete={(user) => {
              setIsDeleting(true);
              handleDeleteUser(user);
            }}
          />
        </Paper>
      </Box>

      {isAdmin && userID && !isDeleting && (
        <UpdateUserForm
          updateData={updateData}
          setUpdateData={setUpdateData}
          handleUpdateUser={handleUpdateUser}
          onCancel={() => setUserID(null)}
        />
      )}

      <Button
        variant="outlined"
        color="primary"
        onClick={() => router.push('/admin')} // Navigates to the admin page
        sx={{ textTransform: 'none', mt: 2 }}
      >
        Back to Admin
      </Button>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminUserService;
