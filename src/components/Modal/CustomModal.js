// components/Modal/CustomModal.js
import React from 'react';
import { Modal, Box, Typography } from '@mui/material';

const CustomModal = ({ open, onClose, title, children }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 400, bgcolor: 'background.paper', borderRadius: '8px', p: 4, boxShadow: 24
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
        {children}
      </Box>
    </Modal>
  );
};

export default CustomModal;