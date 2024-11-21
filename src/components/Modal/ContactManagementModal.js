// components/ContactManagementModal.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Box,
  TextField,
} from '@mui/material';

const ContactManagementModal = ({
  open,
  onClose,
  user,
  contacts,
  isAdding,
  setIsAdding,
  newContact,
  setNewContact,
  contactToEdit,
  setContactToEdit,
  onSaveContact,
  onDeleteContact,
  resetContactForm,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{`Contacts for ${user?.firstName || ''} ${user?.lastName || ''}`}</DialogTitle>
      <DialogContent>
        {contacts.length > 0
          ? contacts.map((contact) => (
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
                    onClick={() => onDeleteContact(contact.contactID)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          : //   <Typography variant="body2" color="textSecondary" align="center">
            //     No contacts available for this user. Add one using the Add Contact button below.
            //   </Typography>
            !isAdding && (
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Typography variant="body2" color="textSecondary" align="center">
                  No contacts available for this user. Add one using the Add Contact button below.
                </Typography>
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
              </Box>
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
              <Button variant="contained" color="primary" onClick={onSaveContact}>
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
        {!isAdding && contacts.length > 0 && (
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
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactManagementModal;
