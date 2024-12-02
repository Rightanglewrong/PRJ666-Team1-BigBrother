// src/pages/contacts.js
import React from "react";
import { Container, Typography, Box, Link } from "@mui/material";
import { useTheme, useThemeStyles } from "@/components/ThemeContext"; // Import ThemeContext

export default function Contacts() {
  const { darkMode } = useTheme(); // Access the dark mode state

  // Define styles based on Dark Mode
  const colors = useThemeStyles();

  return (
    <Box
      sx={{
        backgroundColor: colors.background, // Page-wide background
        color: colors.text, // Text color
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Align content to the center
        p: { xs: 2, md: 4 },
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          p: 3,
          backgroundColor: { xs: 'transparent', md: colors.containerBackground}, // No background on mobile
          borderRadius: { xs: 0, md: 2 }, // Remove border radius on mobile
          boxShadow: { xs: 'none', md: '0px 2px 8px rgba(0, 0, 0, 0.1)' }, // Hide shadow on mobile
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Have questions or need support? We are here to help! Reach out to us using the following
          contact methods:
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Customer Support
        </Typography>
        <Typography variant="body1">
          Email:{" "}
          <Link
            href="mailto:support@bigbrother.com"
            sx={{ color: colors.link, textDecoration: "underline" }}
          >
            support@bigbrother.com
          </Link>
        </Typography>
        <Typography variant="body1">
          Phone:{" "}
          <Link
            href="tel:+1234567890"
            sx={{ color: colors.link, textDecoration: "underline" }}
          >
            +1 (234) 567-890
          </Link>
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Business Hours
        </Typography>
        <Typography variant="body1">Monday to Friday: 9:00 AM - 5:00 PM EST</Typography>
        <Typography variant="body1">Saturday and Sunday: Closed</Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Headquarters
        </Typography>
        <Typography variant="body1">Big Brother Inc.</Typography>
        <Typography variant="body1">123 Main Street, Suite 456</Typography>
        <Typography variant="body1">Toronto, ON, Canada</Typography>
        <Typography variant="body1">Postal Code: M1A 2B3</Typography>
        <Typography variant="body1" sx={{ mt: 3 }}>
          We look forward to hearing from you!
        </Typography>
      </Container>
    </Box>
  );
}