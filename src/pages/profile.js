import { useState, useEffect } from 'react';
import { useUser } from '@/components/authenticate';
import { updateUserProfile, getCurrentUser } from '../utils/api';
import { addContact, fetchContacts, updateContact, deleteContact } from '@/utils/contactApi';
import { withAuth } from '@/hoc/withAuth';
import { Box, Container, Typography, Button, Snackbar, Alert, Stack } from '@mui/material';
import { styled } from '@mui/system';
import ProfileEditor from '@/components/Form/ProfileEditor';
import ContactList from '@/components/List/ContactList';

const ProfilePage = () => {
  const user = useUser();

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Ensure the container fills the viewport
      }}
    >
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
    </Box>
  );
};
export default withAuth(ProfilePage);
