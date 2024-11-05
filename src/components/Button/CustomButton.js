import React from "react";
import { Button } from "@mui/material";
import { styled } from "@mui/system";

// Customizing the Material UI Button component
const StyledButton = styled(Button)(({ theme }) => ({
  padding: "10px 20px",
  fontWeight: "bold",
  borderRadius: "6px",
  transition: "all 0.3s ease",
  textTransform: "none", // Keeps button text from being uppercase

  "&.MuiButton-containedPrimary": {
    backgroundColor: "#3498db",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2980b9",
    },
  },

  "&.MuiButton-containedSecondary": {
    backgroundColor: "#2ecc71",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#27ae60",
    },
  },

  "&.MuiButton-outlinedPrimary": {
    borderColor: "#3498db",
    color: "#3498db",
    "&:hover": {
      borderColor: "#2980b9",
      backgroundColor: "rgba(52, 152, 219, 0.1)",
    },
  },

  "&.MuiButton-outlinedSecondary": {
    borderColor: "#2ecc71",
    color: "#2ecc71",
    "&:hover": {
      borderColor: "#27ae60",
      backgroundColor: "rgba(46, 204, 113, 0.1)",
    },
  },
}));

const CustomButton = ({ children, color = "primary", variant = "contained", onClick, fullWidth = false }) => {
  return (
    <StyledButton
      color={color}
      variant={variant}
      onClick={onClick}
      fullWidth={fullWidth}
    >
      {children}
    </StyledButton>
  );
};

export default CustomButton;