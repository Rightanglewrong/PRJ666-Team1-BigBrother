import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { styled } from '@mui/system';
import ConfirmationModal from '@/components/Modal/ConfirmationModal'; 

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
    <Box> 
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <Card
            key={contact.contactID}
            variant="outlined"
            sx={{
              my: 2,
              backgroundColor: '#f7f5f5',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            <CardContent>
              <Typography variant="h6">
                {`${contact.firstName} ${contact.lastName}`}
              </Typography>
              <Typography>Phone: {contact.phoneNumber}</Typography>
              <Typography>Relationship: {contact.relationship}</Typography>
              <Typography>Address: {contact.address}</Typography>
            </CardContent>
            <CardActions>
              <EditButton onClick={() => handleEditContact(contact)}>Edit</EditButton>
              <DeleteButton onClick={() => {
                setContactToDelete(contact);
                setModalOpen(true);
              }}>
                Delete
              </DeleteButton>
            </CardActions>
          </Card>
        ))
      ) : (
        <Typography>No contacts available.</Typography>
      )}

      {isAdding && (
        <Box component="form" my={2}>
          <TextField
            label="First Name"
            name="firstName"
            value={newContact.firstName}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={newContact.lastName}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={newContact.phoneNumber}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Relationship"
            name="relationship"
            value={newContact.relationship}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Address"
            name="address"
            value={newContact.address}
            onChange={handleInputChange}
            fullWidth
          />
          <Box mt={2} display="flex" justifyContent="space-between">
            <AddContactButton onClick={handleSaveContact}>
              {editingContact ? 'Update' : 'Add'}
            </AddContactButton>
            <Button variant="outlined" color="secondary" onClick={resetForm}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {!isAdding && (
        <AddContactButton onClick={() => setIsAdding(true)} sx={{ mt: 2 }}>
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
          setModalOpen(false);
          setContactToDelete(null);
        }}
      />
    </Box>
  );
};

export default ContactList;
