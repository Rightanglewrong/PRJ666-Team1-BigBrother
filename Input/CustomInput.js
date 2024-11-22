// src/components/CustomInput.js
import React from "react";
import { TextField } from "@mui/material";

const CustomInput = ({ label, ...props }) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      sx={{
        "& .MuiInputLabel-root": {
          transform: "translate(14px, -3px) scale(0.85)",
        },
      }}
      {...props}
    />
  );
};

export default CustomInput;
