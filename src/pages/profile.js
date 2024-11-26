import { useState, useEffect } from 'react';
import { useUser } from '@/components/authenticate';
import { updateUserProfile, getCurrentUser } from '../utils/api';
import { addContact, fetchContacts, updateContact, deleteContact } from '@/utils/contactApi';
import { withAuth } from '@/hoc/withAuth';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Stack,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { styled } from '@mui/system';
import ProfileEditor from '@/components/Form/ProfileEditor';
import ContactList from '@/components/List/ContactList';

const AddContactButton = styled(Button)({
  backgroundColor: '#4CAF50',
  color: 'white',
  '&:hover': { backgroundColor: '#45a049' },
});

const EditButton = styled(Button)({
  backgroundColor: '#3498db',
  color: 'white',
  '&:hover': { backgroundColor: '#2980b9' },
});

const DeleteButton = styled(Button)({
  backgroundColor: '#e74c3c',
  color: 'white',
  '&:hover': { backgroundColor: '#c0392b' },
});

const ProfilePage = () => {
  const user = useUser();

  // Profile state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [locationID, setLocationID] = useState(user?.locationID || '');
  const [accountType] = useState(user?.accountType || ''); // Account type is uneditable
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Contact state
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    relationship: '',
    address: '',
  });
  const [editingContact, setEditingContact] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Load contacts on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const fetchedContacts = await fetchContacts(user.userID);
        setContacts(fetchedContacts);
      } catch (error) {
        setError(error.message || 'Error fetching contacts.');
      }
    };
    if (user) loadContacts();
  }, [user]);

  // Update profile handler
  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await updateUserProfile(updatedData);

      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      const updatedUser = await getCurrentUser();

      if (updatedUser.accStatus === 'PENDING') {
        setError('Your account is now pending reapproval. You will be logged out.');
        localStorage.removeItem('token');
        setTimeout(() => (window.location.href = '/login'), 3000);
        return;
      }

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(`Failed to update profile: ${err.message}`);
    }
  };

  // Save or update contact
  const handleSaveContact = async () => {
    try {
      const contactData = { userID: user.userID, ...newContact };
      if (editingContact) {
        await updateContact(editingContact.contactID, contactData);
        setSuccess('Contact updated successfully!');
      } else {
        await addContact(user.userID, contactData);
        setSuccess('Contact added successfully!');
      }
      const updatedContacts = await fetchContacts(user.userID);
      setContacts(updatedContacts);
      resetContactForm();
    } catch (error) {
      setError(`Error adding/updating contact: ${error.message}`);
    }
  };

  const handleEditContact = (contact) => {
    setNewContact(contact);
    setEditingContact(contact);
    setIsAdding(true);
  };

  const handleDeleteContact = async (contactID) => {
    try {
      await deleteContact(contactID);
      setContacts((prevContacts) => prevContacts.filter((c) => c.contactID !== contactID));
      setSuccess('Contact deleted successfully!');
    } catch (error) {
      setError(`Error deleting contact: ${error.message}`);
    }
  };

  const resetContactForm = () => {
    setNewContact({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      relationship: '',
      address: '',
    });
    setEditingContact(null);
    setIsAdding(false);
  };

  const handleInputChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  const titleStyle = {
    fontWeight: 'bold',
    fontSize: '1.8rem',
    textTransform: 'uppercase',
    color: '#2c3e50',
    mb: 0.1,
    borderBottom: '2px solid #4CAF50',
    display: 'inline-block',
    paddingBottom: '5px',
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Notifications */}
      <Snackbar open={Boolean(success)} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        {/* Left Section: Profile */}
        <Stack spacing={2} sx={{ flex: 1 }}>
          {/* Profile Title */}
          <Typography variant="h4" align="center" sx={titleStyle}>
            Profile
          </Typography>

          {/* Profile Form */}
          <ProfileEditor
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onSuccess={setSuccess}
            onError={setError}
          />
        </Stack>

        {/* Right Section: Contacts */}
        <Stack spacing={2} sx={{ flex: 1 }}>
          {/* Contacts Title */}
          <Typography variant="h4" align="center" sx={titleStyle}>
            Contacts
          </Typography>

          {/* Contacts List */}
          <ContactList
            userID={user?.userID}
            fetchContactsApi={fetchContacts}
            addContactApi={addContact}
            updateContactApi={updateContact}
            deleteContactApi={deleteContact}
            onSuccess={setSuccess}
            onError={setError}
          />
        </Stack>
      </Stack>
    </Container>
  );
};

export default withAuth(ProfilePage);
