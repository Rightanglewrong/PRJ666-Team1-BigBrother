// src/pages/terms-of-service.js
import React from "react";
import { Container, Typography, Box, Link } from "@mui/material";
import { useTheme } from "@/components/ThemeContext"; // Import ThemeContext

export default function TermsOfService() {
  const { darkMode, handMode } = useTheme(); // Access dark mode and hand mode states

  // Define styles based on dark mode and hand mode
  const colors = {
    text: darkMode ? "#f1f1f1" : "#333", // Light text for dark mode, dark text otherwise
    background: darkMode ? "#121212" : "#f7f9fc", // Dark background for dark mode, light otherwise
    containerBackground: darkMode ? "#2c2c2c" : "#ffffff", // Slight contrast for container
  };

  const alignment = handMode === "left" ? "flex-start" : handMode === "right" ? "flex-end" : "center";

  return (
    <Box
      sx={{
        backgroundColor: colors.background, // Page-wide background color
        color: colors.text, // Page-wide text color
        minHeight: "100vh",
        display: "flex",
        justifyContent: alignment, // Align content based on hand mode
        alignItems: "center",
        p: { xs: 2, md: 4 }, // Padding adjusts for screen size
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          p: 3,
          backgroundColor: { xs: "transparent", md: colors.containerBackground }, // Transparent for mobile, styled for larger screens
          borderRadius: { xs: 0, md: 2 }, // Remove border radius for mobile
          boxShadow: { xs: "none", md: "0px 2px 8px rgba(0, 0, 0, 0.1)" }, // No shadow for mobile
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Welcome to Big Brother App. By accessing or using our platform, you agree to be bound by
          the following terms and conditions. Please read them carefully before using the app.
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          1. Use of Service
        </Typography>
        <Typography variant="body1">
          You agree to use the app responsibly and in compliance with all applicable laws and
          regulations. Unauthorized use of the app is prohibited.
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          2. Privacy Policy
        </Typography>
        <Typography variant="body1">
          Your privacy is important to us. Please review our Privacy Policy to understand how we
          collect, use, and protect your information.
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          3. Limitation of Liability
        </Typography>
        <Typography variant="body1">
          We are not liable for any damages arising from the use of our app. Use the app at your own
          risk.
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          4. Updates to Terms
        </Typography>
        <Typography variant="body1">
          We reserve the right to update these terms at any time. Please review them periodically
          for any changes.
        </Typography>
        <Typography variant="body1" sx={{ mt: 3 }}>
          If you have any questions about these terms, feel free to contact us at
          <Link
            href="mailto:support@bigbrother.com"
            sx={{ color: darkMode ? "#64b5f6" : "#3498db", textDecoration: "underline" }}
          >
            support@bigbrother.com
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}