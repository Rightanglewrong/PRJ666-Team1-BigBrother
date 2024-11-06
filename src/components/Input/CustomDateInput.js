import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const CustomDateInput = ({ label, value, onChange }) => {
  return (
    <TextField
      label={label}
      type="date"
      variant="outlined"
      fullWidth
      value={value}
      onChange={onChange}
      slots={{
        startAdornment: (
          <InputAdornment position="start">
            <CalendarTodayIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiInputBase-root": {
          paddingLeft: "8px", // Adjust padding for icon spacing
        },
        marginBottom: "16px",
      }}
    />
  );
};

export default CustomDateInput;
