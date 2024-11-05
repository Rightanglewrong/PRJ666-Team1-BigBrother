// components/Button/CustomButton.js
import React from 'react';
import Button from '@mui/material/Button';

const CustomButton = ({ color = 'primary', variant = 'contained', size = 'medium', children, ...props }) => {
  return (
    <Button color={color} variant={variant} size={size} {...props}>
      {children}
    </Button>
  );
};

export default CustomButton;