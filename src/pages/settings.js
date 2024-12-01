import React from 'react';
import { Container, Typography, Box, RadioGroup, Radio, FormControlLabel, Divider } from '@mui/material';
import { useTheme } from '@/components/ThemeContext';
import { useHandMode } from '@/components/HandModeContext';

const SettingsPage = () => {
  const { colorblindMode, setMode } = useTheme(); // Access colorblind mode
  const { handMode, setHandMode } = useHandMode(); // Access hand mode

  const handleHandModeChange = (event) => {
    setHandMode(event.target.value); // Update global hand mode
  };

  const handleColorModeChange = (event) => {
    setMode(event.target.value); // Update global colorblind mode
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 4,
        mb: 4,
        p: 3,
        backgroundColor: '#f7f9fc',
        borderRadius: 2,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Settings
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Hand Mode Section */}
      <Typography variant="h6" gutterBottom>
        Hand Mode
      </Typography>
      <RadioGroup
        value={handMode}
        onChange={handleHandModeChange}
        row
        sx={{ justifyContent: 'center' }}
      >
        <FormControlLabel value="none" control={<Radio />} label="No Preference" />
        <FormControlLabel value="left" control={<Radio />} label="Left-Hand Mode" />
        <FormControlLabel value="right" control={<Radio />} label="Right-Hand Mode" />
      </RadioGroup>

      <Divider sx={{ my: 2 }} />

      {/* Colorblind Mode Section */}
      <Typography variant="h6" gutterBottom>
        Colorblind Mode
      </Typography>
      <RadioGroup
        value={colorblindMode}
        onChange={handleColorModeChange}
        row
        sx={{ justifyContent: 'center' }}
      >
        <FormControlLabel value="none" control={<Radio />} label="No Colorblind" />
        <FormControlLabel value="red-green" control={<Radio />} label="Red-Green Mode" />
        <FormControlLabel value="blue-yellow" control={<Radio />} label="Blue-Yellow Mode" />
      </RadioGroup>
    </Container>
  );
};

export default SettingsPage;