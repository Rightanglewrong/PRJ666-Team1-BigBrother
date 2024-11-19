import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link"; // Import Link from next/link
import { login } from "../utils/api";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if a token is present in localStorage and redirect to dashboard if so
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/HomePage");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login(email, password);
      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("userLoggedIn", "true");
        window.dispatchEvent(new Event("storage")); // Trigger the storage event manually
        // Redirect to homepage after successful login
        window.location.href = "/HomePage";
      } else if (
        result.error == "Account has not yet been Approved by daycare admin."
      ) {
        setError("Login failed. Account has not yet been approved.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

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
        maxWidth="xs"
        sx={{
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#3498db",
              color: "#fff",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#2980b9" },
              textTransform: "none",
            }}
            fullWidth
          >
            Log In
          </Button>
        </Box>

        <Box mt={2}>
          <Link href="/forgot-password" passHref>
            <Typography
              variant="body2"
              sx={{
                color: "#3498db",
                mb: 1,
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Forgot password?
            </Typography>
          </Link>
          <Link href="/register" passHref>
            <Typography
              variant="body2"
              sx={{
                color: "#3498db",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Register Now!
            </Typography>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
