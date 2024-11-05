"use client"; // This marks the component as a Client Component

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Correct import from next/navigation
import Link from "next/link";
import { Box, Typography, Button, Container } from "@mui/material";

export default function Home() {
  const router = useRouter(); // using useRouter from next/navigation

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.push("/HomePage"); // Redirect to homepage if token is present
    }
  }, [router]);

  return (
    <Box
      sx={{
        backgroundImage: "url('/background/background3.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          padding: 6,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Welcome to Big Brother App
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Easily manage and stay connected with your childcare services.
        </Typography>
        <Box display="flex" justifyContent="center" gap={5}>
          <Link href="/login" passHref>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#3498db",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#2980b9",
                  transform: "scale(1.05)",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
                },
                textTransform: "none",
                px: 4,
                py: 1.5,
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              Login
            </Button>
          </Link>
          <Link href="/register" passHref>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#2ecc71",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { 
                  backgroundColor: "#27ae60",
                  transform: "scale(1.05)",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
                },
                textTransform: "none",
                px: 4,
                py: 1.5,
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              Register
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
