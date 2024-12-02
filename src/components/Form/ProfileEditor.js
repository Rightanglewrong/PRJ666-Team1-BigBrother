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
import { useTheme } from '@/components/ThemeContext'; // Import ThemeContext

const ProfileEditor = ({ user, onUpdateProfile, onError, onSuccess }) => {
  const { darkMode, handMode, colorblindMode } = useTheme(); // Access Dark Mode, Hand Mode, and Colorblind Mode
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

  // Dynamic styles for modes
  const colors = {
    text: darkMode ? '#f1f1f1' : '#333',
    background: darkMode ? '#121212' : '#ffffff',
    containerBackground: darkMode ? '#2c2c2c' : '#f7f9fc',
    button: {
      primary:
        colorblindMode === 'red-green'
          ? '#1976d2'
          : colorblindMode === 'blue-yellow'
          ? '#6a0dad'
          : '#4caf50',
      primaryHover:
        colorblindMode === 'red-green'
          ? '#1565c0'
          : colorblindMode === 'blue-yellow'
          ? '#580c91'
          : '#43a047',
      secondary:
        colorblindMode === 'red-green'
          ? '#e77f24'
          : colorblindMode === 'blue-yellow'
          ? '#f44336'
          : '#f44336',
      secondaryHover:
        colorblindMode === 'red-green'
          ? '#cc6f1f'
          : colorblindMode === 'blue-yellow'
          ? '#e65100'
          : '#d32f2f',
    },
  };

  const alignment =
    handMode === 'left' ? 'flex-start' : handMode === 'right' ? 'flex-end' : 'center';

  return (
    <Card
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        boxShadow: darkMode ? 'none' : 10,
        backgroundColor: colors.containerBackground,
        color: colors.text,
        transition: 'background-color 0.3s, color 0.3s',
      }}
    >
      {isEditing ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: colors.text }}>
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
            sx={{ input: { color: colors.text }, label: { color: colors.text } }}
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
            sx={{ input: { color: colors.text }, label: { color: colors.text } }}
          />
          <TextField
            label="Location ID"
            name="locationID"
            value={formData.locationID.toUpperCase()}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            sx={{ input: { color: colors.text }, label: { color: colors.text } }}
          />
          <FormControl fullWidth margin="normal" disabled>
            <InputLabel sx={{ color: colors.text }}>Account Type</InputLabel>
            <Select value={accountType}>
              <MenuItem value="Parent">Parent</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" justifyContent={alignment} mt={2}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: colors.button.primary,
                '&:hover': { backgroundColor: colors.button.primaryHover },
                color: '#fff',
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              sx={{
                backgroundColor: colors.button.secondary,
                '&:hover': { backgroundColor: colors.button.secondaryHover },
                color: '#fff',
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <CardContent>
          <Box
            display="grid"
            gap={1}
            sx={{
              gridTemplateColumns: {
                xs: '120px 1fr', // Mobile size
                sm: '150px 1fr', // Full size (small and above)
              },
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              '& > :nth-of-type(2)': {
                fontSize: '0.95rem',
                color: colors.text,
              },
            }}
          >
            <Typography sx={{ fontWeight: 'bold', color: colors.text }}>ID:</Typography>
            <Typography>{user?.userID || 'N/A'}</Typography>

            <Typography sx={{ fontWeight: 'bold', color: colors.text }}>Email:</Typography>
            <Typography>{user?.email || 'N/A'}</Typography>

            <Typography sx={{ fontWeight: 'bold', color: colors.text }}>First Name:</Typography>
            <Typography>{formData.firstName}</Typography>

            <Typography sx={{ fontWeight: 'bold', color: colors.text }}>Last Name:</Typography>
            <Typography>{formData.lastName}</Typography>

            <Typography sx={{ fontWeight: 'bold', color: colors.text }}>Location ID:</Typography>
            <Typography>{formData.locationID}</Typography>

            <Typography sx={{ fontWeight: 'bold', color: colors.text }}>Account Type:</Typography>
            <Typography>{accountType}</Typography>

            <Typography sx={{ fontWeight: 'bold', color: colors.text }}>Account Status:</Typography>
            <Typography>{accStatus || 'N/A'}</Typography>
          </Box>
        </CardContent>
      )}
      {!isEditing && (
        <CardActions sx={{ justifyContent: alignment }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.button.primary,
              '&:hover': { backgroundColor: colors.button.primaryHover },
              color: '#fff',
            }}
            onClick={() => setIsEditing(true)}
          >
            Update
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ProfileEditor;
