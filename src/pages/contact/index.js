import React, { useState, useEffect } from "react";
import {
  addContact,
  fetchContacts,
  updateContact,
  deleteContact,
} from "@/utils/contactApi";
import { getCurrentUser } from "@/utils/api";
import {
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  Box,
  Container,
  Grid,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";

const AddContactButton = styled(Button)({
  backgroundColor: "#4CAF50",
  color: "white",
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: "bold",
  borderRadius: "6px",
  "&:hover": {
    backgroundColor: "#45a049",
  },
});

const EditButton = styled(Button)({
  backgroundColor: "#3498db",
  color: "white",
  fontWeight: "bold",
  borderRadius: "6px",
  "&:hover": {
    backgroundColor: "#2980b9",
  },
});

const DeleteButton = styled(Button)({
  backgroundColor: "#e74c3c",
  color: "white",
  fontWeight: "bold",
  borderRadius: "6px",
  "&:hover": {
    backgroundColor: "#c0392b",
  },
});

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    contactID: null,
    firstName: "",
    lastName: "",
    phoneNumber: "",
    relationship: "",
    address: "",
  });
  const [editingContact, setEditingContact] = useState(null);
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const user = await getCurrentUser();
        const fetchedContacts = await fetchContacts(user.userID);
        setContacts(fetchedContacts);
      } catch (error) {
        setMessage(error.message || "Error fetching contacts.");
      }
    };
    loadContacts();
  }, []);

  const handleSaveContact = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || !currentUser.userID) {
        setMessage("User ID is missing.");
        return;
      }

      const newContactData = {
        userID: currentUser.userID,
        ...newContact,
      };

      if (editingContact) {
        await updateContact(editingContact.contactID, newContactData);
        setMessage("Contact updated successfully!");
      } else {
        await addContact(newContactData);
        setMessage("Contact added successfully!");
      }

      const updatedContacts = await fetchContacts(currentUser.userID);
      setContacts(updatedContacts);

      setNewContact({
        contactID: null,
        firstName: "",
        lastName: "",
        phoneNumber: "",
        relationship: "",
        address: "",
      });
      setEditingContact(null);
      setIsAdding(false);
    } catch (error) {
      setMessage(`Error adding/updating contact: ${error.message}`);
    }
  };

  const handleEditClick = (contact) => {
    setNewContact(contact);
    setEditingContact(contact);
    setIsAdding(true);
  };

  const handleDeleteContact = async (contactID) => {
    try {
      await deleteContact(contactID);
      setContacts((prevContacts) =>
        prevContacts.filter((c) => c.contactID !== contactID)
      );
      setMessage("Contact deleted successfully!");
    } catch (error) {
      setMessage(`Error deleting contact: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: "#2c3e50" }}>
        Contacts
      </Typography>

      {message && (
        <Snackbar
          open={Boolean(message)}
          autoHideDuration={6000}
          onClose={() => setMessage("")}
        >
          <Alert onClose={() => setMessage("")} severity="info" sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      )}

      <Box my={3}>
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <Card
              key={contact.contactID}
              variant="outlined"
              sx={{ my: 2, backgroundColor: "#f9f9f9", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {contact.firstName} {contact.lastName}
                </Typography>
                <Typography variant="body2">Phone: {contact.phoneNumber}</Typography>
                <Typography variant="body2">Relationship: {contact.relationship}</Typography>
                <Typography variant="body2">Address: {contact.address}</Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <EditButton onClick={() => handleEditClick(contact)} size="small">
                  Edit
                </EditButton>
                <DeleteButton onClick={() => handleDeleteContact(contact.contactID)} size="small">
                  Remove
                </DeleteButton>
              </CardActions>
            </Card>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 3 }}>
            You can add contacts by selecting the Add Contact button.
          </Typography>
        )}
      </Box>

      {isAdding && (
        <Box component="form" my={3} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="First Name"
            name="firstName"
            value={newContact.firstName}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={newContact.lastName}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={newContact.phoneNumber}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Relationship"
            name="relationship"
            value={newContact.relationship}
            onChange={handleInputChange}
          />
          <TextField
            label="Address"
            name="address"
            value={newContact.address}
            onChange={handleInputChange}
          />
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleSaveContact}
                sx={{
                  backgroundColor: "#2ecc71",
                  "&:hover": { backgroundColor: "#27ae60" },
                }}
              >
                Save
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => setIsAdding(false)}
                sx={{
                  backgroundColor: "#95a5a6",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#7f8c8d" },
                }}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {!isAdding && (
        <>
          <Divider sx={{ my: 2 }} />
          <AddContactButton fullWidth onClick={() => setIsAdding(true)} sx={{ mt: 3 }}>
            Add Contact
          </AddContactButton>
        </>
      )}
    </Container>
  );
};

export default ContactList;