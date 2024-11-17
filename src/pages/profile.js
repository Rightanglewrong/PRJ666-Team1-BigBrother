import { useState, useEffect } from "react";
import { useUser } from "@/components/authenticate";
import { updateUserProfile } from "../utils/api";
import {
  addContact,
  fetchContacts,
  updateContact,
  deleteContact,
} from "@/utils/contactApi";
import { withAuth } from "@/hoc/withAuth";
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import styles from "./Profile.module.css";
import { styled } from "@mui/system";

const AddContactButton = styled(Button)({
  backgroundColor: "#4CAF50",
  color: "white",
  "&:hover": { backgroundColor: "#45a049" },
});

const EditButton = styled(Button)({
  backgroundColor: "#3498db",
  color: "white",
  "&:hover": { backgroundColor: "#2980b9" },
});

const DeleteButton = styled(Button)({
  backgroundColor: "#e74c3c",
  color: "white",
  "&:hover": { backgroundColor: "#c0392b" },
});

const ProfilePage = () => {
  const user = useUser();

  // Profile state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [locationID, setLocationID] = useState(user?.locationID || "");
  const [accountType] = useState(user?.accountType || ""); // Account type is uneditable
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Contact state
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    relationship: "",
    address: "",
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
        setError(error.message || "Error fetching contacts.");
      }
    };
    if (user) loadContacts();
  }, [user]);

  // Update profile handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updatedData = { firstName, lastName, locationID, accountType };
    try {
      await updateUserProfile(updatedData);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  // Save or update contact
  const handleSaveContact = async () => {
    try {
      const contactData = { userID: user.userID, ...newContact };
      if (editingContact) {
        await updateContact(editingContact.contactID, contactData);
        setSuccess("Contact updated successfully!");
      } else {
        await addContact(contactData);
        setSuccess("Contact added successfully!");
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
      setContacts((prevContacts) =>
        prevContacts.filter((c) => c.contactID !== contactID)
      );
      setSuccess("Contact deleted successfully!");
    } catch (error) {
      setError(`Error deleting contact: ${error.message}`);
    }
  };

  const resetContactForm = () => {
    setNewContact({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      relationship: "",
      address: "",
    });
    setEditingContact(null);
    setIsAdding(false);
  };

  const handleInputChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  const titleStyle = {
    fontWeight: "bold",
    fontSize: "1.8rem",
    textTransform: "uppercase",
    color: "#2c3e50",
    mb: 0.1,
    borderBottom: "2px solid #4CAF50",
    display: "inline-block",
    paddingBottom: "5px",
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>

{/* Profile and Contacts Titles */}
<Grid container spacing={4}>
      {/* Left Column: Profile Title */}
      <Grid item xs={12} md={6}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={titleStyle}
        >
          Profile
        </Typography>
      </Grid>

      {/* Right Column: Contacts Title */}
      <Grid item xs={12} md={6} >
        <Typography
          variant="h4"
          gutterBottom
          sx={titleStyle}
        >
          Contacts
        </Typography>
      </Grid>
    </Grid>

      {/* Notifications */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
      >
        <Alert
          onClose={() => setSuccess("")}
          severity="success"
          variant="filled"
        >
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert onClose={() => setError("")} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>

      <Grid container spacing={4}>
        {/* Left Column: Profile Form */}
        <Grid item xs={12} md={6}>
          <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 2 }}>
            <TextField
              label="User ID"
              value={user?.userID || ""}
              fullWidth
              disabled
              margin="normal"
            />
            <TextField
              label="Email"
              value={user?.email || ""}
              fullWidth
              disabled
              margin="normal"
            />
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Location ID"
              value={locationID}
              onChange={(e) => setLocationID(e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal" disabled>
              <InputLabel>Account Type</InputLabel>
              <Select value={accountType}>
                <MenuItem value="Parent">Parent</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Update Info
            </Button>
          </Box>
        </Grid>

        {/* Right Column: Contact List */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              my: 2,
              width: "100%", // Ensure the content doesn't stretch beyond the column
              maxWidth: "500px", // Optional: Limit the max width of the content
            }}
          >
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <Card
                  key={contact.contactID}
                  variant="outlined"
                  sx={{
                    my: 2,
                    backgroundColor: "#f9f9f9",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {`${contact.firstName} ${contact.lastName}`}
                    </Typography>
                    <Typography variant="body2">
                      Phone: {contact.phoneNumber}
                    </Typography>
                    <Typography variant="body2">
                      Relationship: {contact.relationship}
                    </Typography>
                    <Typography variant="body2">
                      Address: {contact.address}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <EditButton
                      onClick={() => handleEditContact(contact)}
                      size="small"
                    >
                      Edit
                    </EditButton>
                    <DeleteButton
                      onClick={() => handleDeleteContact(contact.contactID)}
                      size="small"
                    >
                      Remove
                    </DeleteButton>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                No contacts available. Use the Add Contact button to add one.
              </Typography>
            )}
          </Box>

          {/* Add/Edit Contact Form */}
          {isAdding && (
            <Box
              component="form"
              my={1}
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ width: "100%", maxWidth: "500px" }}
            >
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
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveContact}
                >
                  {editingContact ? "Update Contact" : "Add Contact"}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={resetContactForm}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {!isAdding && (
            <AddContactButton
              onClick={() => setIsAdding(true)}
              sx={{
                width: "100%", // Matches the container width
                maxWidth: "500px", // Matches the container's maxWidth
              }}
            >
              Add Contact
            </AddContactButton>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default withAuth(ProfilePage);
