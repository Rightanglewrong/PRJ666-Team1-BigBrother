import React, { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, CardActions, Typography, TextField, Button } from '@mui/material';
import { styled } from '@mui/system';
import ConfirmationModal from '@/components/Modal/ConfirmationModal';
import { useTheme } from '@/components/ThemeContext'; // Import ThemeContext

// Styled Buttons
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

const ContactList = ({
  userID,
  fetchContactsApi,
  addContactApi,
  updateContactApi,
  deleteContactApi,
  onSuccess,
  onError,
}) => {
  const { darkMode, colorblindMode, handMode } = useTheme(); // Access theme context
  const [contacts, setContacts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    relationship: '',
    address: '',
  });
  const [modalOpen, setModalOpen] = useState(false); // Track modal state
  const [contactToDelete, setContactToDelete] = useState(null); // Track contact to delete

  // Ref for the edit form
  const formRef = useRef(null);

  // Dynamic styles based on modes
  const colors = {
    text: darkMode ? '#f1f1f1' : '#333',
    background: darkMode ? '#121212' : '#ffffff',
    buttonPrimary:
      colorblindMode === 'red-green'
        ? '#1976d2'
        : colorblindMode === 'blue-yellow'
        ? '#6a0dad'
        : '#4CAF50',
    buttonPrimaryHover:
      colorblindMode === 'red-green'
        ? '#1565c0'
        : colorblindMode === 'blue-yellow'
        ? '#580c91'
        : '#43a047',
    buttonSecondary:
      colorblindMode === 'red-green'
        ? '#e77f24'
        : colorblindMode === 'blue-yellow'
        ? '#f44336'
        : '#f44336',
    buttonSecondaryHover:
      colorblindMode === 'red-green'
        ? '#cc6f1f'
        : colorblindMode === 'blue-yellow'
        ? '#e65100'
        : '#d32f2f',
  };

  const alignment =
    handMode === 'left' ? 'flex-start' : handMode === 'right' ? 'flex-end' : 'center';

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await fetchContactsApi(userID);
        setContacts(data);
      } catch (error) {
        onError(error.message || 'Error fetching contacts.');
      }
    };

    if (userID) loadContacts();
  }, [userID, fetchContactsApi, onError]);

  const handleInputChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  const handleSaveContact = async () => {
    try {
      if (editingContact) {
        await updateContactApi(editingContact.contactID, newContact);
        onSuccess('Contact updated successfully!');
      } else {
        await addContactApi(userID, newContact);
        onSuccess('Contact added successfully!');
      }
      const updatedContacts = await fetchContactsApi(userID);
      setContacts(updatedContacts);
      resetForm();
    } catch (error) {
      onError(error.message || 'Error saving contact.');
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setNewContact(contact);
    setIsAdding(true);

    // Scroll to the form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleDeleteContact = async () => {
    try {
      await deleteContactApi(contactToDelete.contactID);
      setContacts((prev) => prev.filter((c) => c.contactID !== contactToDelete.contactID));
      setContactToDelete(null);
      setModalOpen(false);
      onSuccess('Contact deleted successfully!');
    } catch (error) {
      onError(error.message || 'Error deleting contact.');
    }
  };

  const resetForm = () => {
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

  return (
    <Box sx={{ color: colors.text, backgroundColor: colors.background }}>
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <Card
            key={contact.contactID}
            variant="outlined"
            sx={{
              my: 2,
              backgroundColor: colors.background,
              color: colors.text,
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            <CardContent>
              <Typography variant="h6">{`${contact.firstName} ${contact.lastName}`}</Typography>
              <Typography>Phone: {contact.phoneNumber}</Typography>
              <Typography>Relationship: {contact.relationship}</Typography>
              <Typography>Address: {contact.address}</Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: alignment }}>
              <EditButton
                variant="contained"
                sx={{
                  backgroundColor: colors.buttonPrimary,
                  '&:hover': { backgroundColor: colors.buttonPrimaryHover },
                }}
                onClick={() => handleEditContact(contact)}
              >
                Edit
              </EditButton>
              <DeleteButton
                variant="outlined"
                sx={{
                  backgroundColor: colors.buttonSecondary,
                  '&:hover': { backgroundColor: colors.buttonSecondaryHover },
                  color: colors.text,
                }}
                onClick={() => {
                  resetForm();
                  setContactToDelete(contact);
                  setModalOpen(true);
                }}
              >
                Delete
              </DeleteButton>
            </CardActions>
          </Card>
        ))
      ) : (
        <Typography>No contacts available.</Typography>
      )}

      {isAdding && (
        <Box component="form" my={3} ref={formRef}>
          <TextField
            label="First Name"
            name="firstName"
            value={newContact.firstName}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ marginBottom: 1, input: { color: colors.text }, label: { color: colors.text } }}
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={newContact.lastName}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ marginBottom: 1, input: { color: colors.text }, label: { color: colors.text } }}
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={newContact.phoneNumber}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: 1, input: { color: colors.text }, label: { color: colors.text } }}
          />
          <TextField
            label="Relationship"
            name="relationship"
            value={newContact.relationship}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: 1, input: { color: colors.text }, label: { color: colors.text } }}
          />
          <TextField
            label="Address"
            name="address"
            value={newContact.address}
            onChange={handleInputChange}
            fullWidth
            sx={{ input: { color: colors.text }, label: { color: colors.text } }}
          />
          <Box mt={1} display="flex" justifyContent={alignment}>
            <AddContactButton 
            variant="contained"
              sx={{
                backgroundColor: colors.buttonPrimary,
                '&:hover': { backgroundColor: colors.buttonPrimaryHover },
                color: '#fff',
              }}
              onClick={handleSaveContact}
            >
              {editingContact ? 'Update' : 'Add'}
            </AddContactButton>
            <Button 
            variant="outlined"
              sx={{
                backgroundColor: colors.buttonSecondary,
                '&:hover': { backgroundColor: colors.buttonSecondaryHover },
                color: colors.text,
              }}
              onClick={resetForm}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {!isAdding && (
        <AddContactButton 
        variant="contained"
          sx={{
            mb: 3,
            backgroundColor: colors.buttonPrimary,
            '&:hover': { backgroundColor: colors.buttonPrimaryHover },
          }}
          onClick={() => setIsAdding(true)}>
          Add Contact
        </AddContactButton>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        open={modalOpen}
        title="Confirm Deletion"
        description={`Are you sure you want to delete the contact "${contactToDelete?.firstName} ${contactToDelete?.lastName}"?`}
        onConfirm={handleDeleteContact}
        onCancel={() => {
          resetForm();
          setModalOpen(false);
          setContactToDelete(null);
        }}
      />
    </Box>
  );
};

export default ContactList;
