import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import Image from "next/image";

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
            <Image
              src="/icons/date_range_24dp.svg"
              alt="Calendar Icon"
              width={24} 
              height={24}
            />
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiInputBase-root": {
          paddingLeft: "8px", 
        },
        marginBottom: "16px",
      }}
    />
  );
};

export default CustomDateInput;
