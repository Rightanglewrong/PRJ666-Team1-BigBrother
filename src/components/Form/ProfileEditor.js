import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const ProfileEditor = ({ user, onUpdateProfile, onError, onSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    locationID: '',
  });
  const [accountType] = useState(user?.accountType || ''); // Account type is uneditable
  const [accStatus] = useState(user?.accStatus || ''); // Account status is uneditable

  // Sync formData with user whenever user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        locationID: user.locationID || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== user[key]) {
        updatedData[key] = formData[key];
      }
    });

    if (Object.keys(updatedData).length === 0) {
      onError('No changes to update');
      return;
    }

    try {
      await onUpdateProfile(updatedData);
      onSuccess('Profile updated successfully');
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      onError(`Failed to update profile: ${err.message}`);
    }
  };

  const handleCancel = () => {
    // Reset formData to the original user data
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      locationID: user?.locationID || '',
    });
    setIsEditing(false); // Exit edit mode
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, boxShadow: 10, backgroundColor: "#f7f5f5" }}>
      {isEditing ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Edit Profile
          </Typography>
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Location ID"
            name="locationID"
            value={formData.locationID.toUpperCase()}
            onChange={handleInputChange}
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
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <CardContent>
          <Box display="grid" gridTemplateColumns="150px 1fr" gap={1}>
            <Typography sx={{ fontWeight: 'bold' }}>ID:</Typography>
            <Typography>{user?.userID || 'N/A'}</Typography>

            <Typography sx={{ fontWeight: 'bold' }}>Email:</Typography>
            <Typography>{user?.email || 'N/A'}</Typography>

            <Typography sx={{ fontWeight: 'bold' }}>First Name:</Typography>
            <Typography>{formData.firstName}</Typography>

            <Typography sx={{ fontWeight: 'bold' }}>Last Name:</Typography>
            <Typography>{formData.lastName}</Typography>

            <Typography sx={{ fontWeight: 'bold' }}>Location ID:</Typography>
            <Typography>{formData.locationID}</Typography>

            <Typography sx={{ fontWeight: 'bold' }}>Account Type:</Typography>
            <Typography>{accountType}</Typography>

            <Typography sx={{ fontWeight: 'bold' }}>Account Status:</Typography>
            <Typography>{accStatus || 'N/A'}</Typography>
          </Box>
        </CardContent>
      )}
      {!isEditing && (
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
            Update
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ProfileEditor;
