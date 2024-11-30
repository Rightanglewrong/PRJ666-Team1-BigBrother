// components/Modal/Snackbar.js
import React from "react";
import { Snackbar, Alert, Box } from "@mui/material";

const SnackbarNotification = ({ open, message, severity, onClose, autoHideDuration = 6000 }) => {
  return (
    <Box>
      <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
        <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SnackbarNotification;
