import React, { useState } from 'react';
import { Container, Typography, Select, MenuItem, Box, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '@/components/ThemeContext';

const Settings = () => {
  const { colorblindMode, setMode } = useTheme(); // Access theme context

  const handleColorblindModeChange = (e) => {
    setMode(e.target.value); // Update colorblind mode
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        p: 3,
        backgroundColor: '#f7f9fc',
        borderRadius: 2,
        boxShadow: 3,
        mb: 4,
      }}
    >
      <Typography variant="h4" align="center" sx={{ mb: 4 }}>
        Settings
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Colorblind Mode Setting */}
        <FormControl fullWidth>
          <InputLabel id="colorblind-mode-label">Colorblind Mode</InputLabel>
          <Select
            labelId="colorblind-mode-label"
            value={colorblindMode}
            onChange={handleColorblindModeChange}
            label="Colorblind Mode"
          >
            <MenuItem value="none">No Colorblind</MenuItem>
            <MenuItem value="red-green">Red-Green Mode</MenuItem>
            <MenuItem value="blue-yellow">Blue-Yellow Mode</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Container>
  );
};

export default Settings;