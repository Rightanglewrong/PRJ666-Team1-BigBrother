import React from 'react';
import { Container, Typography, Box, RadioGroup, Radio, FormControlLabel, Divider, Switch } from '@mui/material';
import { useTheme } from '@/components/ThemeContext';

const SettingsPage = () => {
  const { colorblindMode, setMode, handMode, setHandMode, darkMode, setDarkMode } = useTheme(); // Access modes and setters from ThemeContext

  const handleHandModeChange = (event) => {
    setHandMode(event.target.value); // Update global hand mode
  };

  const handleColorModeChange = (event) => {
    setMode(event.target.value); // Update global colorblind mode
  };

  const handleDarkModeToggle = (event) => {
    setDarkMode(event.target.checked); // Update global dark mode
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        mb: 4,
        p: 4,
        backgroundColor: darkMode ? '#2c2c2c' : '#f7f9fc',
        color: darkMode ? '#ffffff' : '#000000',
        borderRadius: 2,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s, color 0.3s',
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Settings
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Dark Mode Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dark Mode
        </Typography>
        <Switch
          checked={darkMode}
          onChange={handleDarkModeToggle}
          color="primary"
          inputProps={{ 'aria-label': 'Dark Mode Toggle' }}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Hand Mode Section */}
      <Typography variant="h6" gutterBottom>
        Hand Mode
      </Typography>
      <RadioGroup
        value={handMode}
        onChange={handleHandModeChange}
        row
        sx={{
          justifyContent: 'center',
          gap: { xs: 1, sm: 2 }, // Adjust gap for smaller screens
        }}
      >
        <FormControlLabel value="none" control={<Radio />} label="No Preference" />
        <FormControlLabel value="left" control={<Radio />} label="Left-Hand Mode" />
        <FormControlLabel value="right" control={<Radio />} label="Right-Hand Mode" />
      </RadioGroup>

      <Divider sx={{ my: 3 }} />

      {/* Colorblind Mode Section */}
      <Typography variant="h6" gutterBottom>
        Colorblind Mode
      </Typography>
      <RadioGroup
        value={colorblindMode}
        onChange={handleColorModeChange}
        row
        sx={{
          justifyContent: 'center',
          gap: { xs: 1, sm: 2 }, // Adjust gap for smaller screens
        }}
      >
        <FormControlLabel value="none" control={<Radio />} label="No Colorblind" />
        <FormControlLabel value="red-green" control={<Radio />} label="Red-Green Mode" />
        <FormControlLabel value="blue-yellow" control={<Radio />} label="Blue-Yellow Mode" />
      </RadioGroup>
    </Container>
  );
};

export default SettingsPage;