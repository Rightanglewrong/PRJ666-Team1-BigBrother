// components/CustomInput.js
import React from 'react';
import { TextField } from '@mui/material';

const CustomInput = ({ label, ...props }) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      sx={{
        marginBottom: '16px',
      }}
      {...props}
    />
  );
};

export default CustomInput;