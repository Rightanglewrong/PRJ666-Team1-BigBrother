import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';

const UpdateUserForm = ({ updateData, setUpdateData, handleUpdateUser, onCancel }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6">Update User</Typography>
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <TextField
          disabled={updateData.accountType === 'Admin'}
          label="First Name"
          variant="outlined"
          value={updateData.firstName}
          onChange={(e) =>
            setUpdateData((prev) => ({
              ...prev,
              firstName: e.target.value,
            }))
          }
          fullWidth
        />
        <TextField
          disabled={updateData.accountType === 'Admin'}
          label="Last Name"
          variant="outlined"
          value={updateData.lastName}
          onChange={(e) =>
            setUpdateData((prev) => ({
              ...prev,
              lastName: e.target.value,
            }))
          }
          fullWidth
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel>Account Type</InputLabel>
          <Select
            disabled={updateData.accountType === 'Admin'}
            label="Account Type"
            value={updateData.accountType}
            onChange={(e) =>
              setUpdateData((prev) => ({
                ...prev,
                accountType: e.target.value,
              }))
            }
            fullWidth
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
            <MenuItem value="Parent">Parent</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Account Status"
          variant="outlined"
          value={updateData.accStatus}
          disabled
          fullWidth
        />
        <Button variant="contained" color="secondary" onClick={handleUpdateUser}>
          Update User
        </Button>
        <Button variant="outlined" color="default" onClick={onCancel} style={{ marginTop: '10px' }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateUserForm;
