import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  RadioGroup,
  Radio,
  FormControlLabel,
  Divider,
  Switch,
  Tooltip,
} from '@mui/material';
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

  // Apply dark mode to the entire page background
  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#121212' : '#ffffff'; // Dark or light background
    document.body.style.color = darkMode ? '#ffffff' : '#000000'; // Dark or light text
    return () => {
      document.body.style.backgroundColor = ''; // Reset on unmount
      document.body.style.color = ''; // Reset on unmount
    };
  }, [darkMode]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedHandMode = localStorage.getItem('handMode');
    const savedColorblindMode = localStorage.getItem('colorblindMode');

    if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
    if (savedHandMode) setHandMode(savedHandMode);
    if (savedColorblindMode) setMode(savedColorblindMode);
  }, []);

  useEffect(() => {
    console.log('Settings updated:', { darkMode, handMode, colorblindMode });
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('handMode', handMode);
    localStorage.setItem('colorblindMode', colorblindMode);
  }, [darkMode, handMode, colorblindMode]);

  return (
    <Box
      sx={{
        minHeight: '100vh', // Ensure the background covers the full height
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: darkMode ? '#121212' : '#f7f9fc', // Fallback for body styles
        transition: 'background-color 0.3s',
        px: { xs: 2, sm: 4 }, // Add horizontal padding for smaller screens
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          mt: { xs: 1, md: 6 },
          mb: { xs: 1, md: 2 },
          py: { xs: 0, md: 4 },
          px: { xs: 0, md: 4 },
          width: { xs: '100%', sm: '80%', md: '60%' }, // Dynamically set width
          backgroundColor: { xs: 'transparent', md: darkMode ? '#2c2c2c' : '#ffffff' }, // No background on mobile
          color: darkMode ? '#ffffff' : '#000000',
          borderRadius: { xs: 0, md: 2 }, // Remove border radius on mobile
          boxShadow: { xs: 'none', md: '0px 2px 8px rgba(0, 0, 0, 0.1)' }, // Hide shadow on mobile
          transition: 'background-color 0.3s, color 0.3s',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Settings
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Dark Mode Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' }, mb: 3 }}
        >
          <Typography variant="h6" gutterBottom>
            Dark Mode
          </Typography>
          <Typography variant="body2" sx={{ color: darkMode ? '#e0e0e0' : '#757575', mt: 1 }}>
            Enable a dark theme for better visibility in low-light environments.
          </Typography>
          <Tooltip title="Toggle Dark Mode" arrow>
            <Switch
              checked={darkMode}
              onChange={handleDarkModeToggle}
              color="primary"
              inputProps={{ 'aria-label': 'Dark Mode Toggle' }}
            />
          </Tooltip>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Hand Mode Section */}
        <Typography variant="h6" gutterBottom>
          Hand Mode
        </Typography>
        <Typography
          variant="body2"
          align="center"
          sx={{ mb: 2, color: darkMode ? '#e0e0e0' : '#757575' }}
        >
          Choose the layout orientation for optimal interaction.
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
          <Tooltip title="Default layout with no hand preference" arrow>
            <FormControlLabel value="none" control={<Radio />} label="No Preference" />
          </Tooltip>
          <Tooltip title="Optimized for left-hand users" arrow>
            <FormControlLabel value="left" control={<Radio />} label="Left-Hand Mode" />
          </Tooltip>
          <Tooltip title="Optimized for right-hand users" arrow>
            <FormControlLabel value="right" control={<Radio />} label="Right-Hand Mode" />
          </Tooltip>
        </RadioGroup>

        <Divider sx={{ my: 3 }} />

        {/* Colorblind Mode Section */}
        <Typography variant="h6" gutterBottom>
          Colorblind Mode
        </Typography>
        <Typography
          variant="body2"
          align="center"
          sx={{ mb: 2, color: darkMode ? '#e0e0e0' : '#757575' }}
        >
          Select a mode for improved color contrast and accessibility.
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
          <FormControlLabel
            value="none"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>No Colorblind</Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="red-green"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Red-Green</Typography>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    background: 'linear-gradient(90deg, #7f7fff, #ffff7f)',
                    borderRadius: '50%',
                  }}
                />
              </Box>
            }
          />
          <FormControlLabel
            value="blue-yellow"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Blue-Yellow</Typography>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    background: 'linear-gradient(90deg, #e77f24, #3db48c)',
                    borderRadius: '50%',
                  }}
                />
              </Box>
            }
          />
        </RadioGroup>
      </Container>
    </Box>
  );
};

export default SettingsPage;
