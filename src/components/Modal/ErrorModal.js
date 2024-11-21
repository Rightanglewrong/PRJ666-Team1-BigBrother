import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

const ErrorModal = ({ open, onClose, errorMessage }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Error</DialogTitle>
    <DialogContent>
      <DialogContentText>{errorMessage}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default ErrorModal;
