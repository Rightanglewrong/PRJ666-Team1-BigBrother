import { useState, useEffect } from "react";
import { useUser } from "@/components/authenticate";
import { updateUserProfile } from "../utils/api";
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
} from "@mui/material";
import styles from "./Profile.module.css";

const ProfilePage = () => {
  const user = useUser();

  // Use context data to initialize fields
  const [userID] = useState(user?.userID || "")
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [locationID, setLocationID] = useState(user?.locationID || "");
  const [accountType] = useState(user?.accountType || ""); // Account type is uneditable
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form submission to update user info
  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedData = {
      firstName,
      lastName,
      locationID,
      accountType,
    };

    try {
      await updateUserProfile(updatedData); // Assume this sends updated data to backend
      setSuccess("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile", err);
      setError("Failed to update profile");
    }
  };

  return (
    <Container maxWidth="sm" className={styles.fadeIn} sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
        Profile
      </Typography>

      {/* Success and Error Messages */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccess("")} severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError("")} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>

      <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
        {/* User ID */}
        <TextField
          label="User ID"
          value={userID}
          fullWidth
          disabled
          margin="normal"
        />

        {/* Email */}
        <TextField
          label="Email"
          value={user?.email || ""}
          fullWidth
          disabled
          margin="normal"
        />

        {/* First Name */}
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        {/* Last Name */}
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        {/* Location ID */}
        <TextField
          label="Location ID"
          value={locationID}
          onChange={(e) => setLocationID(e.target.value)}
          fullWidth
          margin="normal"
        />

        {/* Account Type */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Account Type</InputLabel>
          <Select value={accountType} disabled>
            <MenuItem value="Parent">Parent</MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </Select>
        </FormControl>

        {/* Submit Button */}
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
    </Container>
  );
};

export default withAuth(ProfilePage); // Wrap the page with the HOC
