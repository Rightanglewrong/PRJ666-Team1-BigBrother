import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signup } from "../utils/api";
import Link from "next/link"; // Import Link from next/link
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  InputLabel,
  FormControl,
} from "@mui/material";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [locationID, setLocationID] = useState("");
  const [accountType, setAccountType] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState(""); // State for email error message
  const [accountTypeError, setAccountTypeError] = useState(""); // State for account type error message
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token"); // Check if token exists
    if (token) {
      localStorage.removeItem("token"); // Remove token from localStorage
      window.location.reload(); // Reload the page
    }
  }, []);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$]).{6,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (email) => {
    // Regular expression to check for an email with "@" and "."
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError(
        "Please enter a valid email address in the format: name@domain.extension."
      );
      return;
    } else {
      setEmailError(""); // Clear error if email is valid
    }

    if (accountTypeError) {
      //Maybe we do not need this error any more !
      alert("Please fix the errors before submitting.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 6 characters, contain at least one uppercase letter, one lowercase letter, and one special character (!@#$)."
      );
      return;
    }

    const signupData = {
      firstName,
      lastName,
      email,
      locationID,
      accountType,
      password,
    };

    try {
      await signup(signupData);
      if (accountType == "Admin" || accountType == "Staff") {
        setSuccess(
          "Registration successful! If registering for an existing Location, please wait to be approved before logging in."
        );
      } else {
        setSuccess("Registration successful!");
      }

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setError("Registration failed. Please try again.");
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
        maxWidth="sm"
        sx={{
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          p: 6,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Register
        </Typography>

        {error && (
          <Snackbar
            open={Boolean(error)}
            autoHideDuration={6000}
            onClose={() => setError("")}
          >
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </Snackbar>
        )}
        {success && (
          <Snackbar
            open={Boolean(success)}
            autoHideDuration={6000}
            onClose={() => setSuccess("")}
          >
            <Alert severity="success" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          </Snackbar>
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
            error={Boolean(emailError)}
            helperText={emailError}
          />

          <TextField
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Location ID"
            type="text"
            value={locationID}
            onChange={(e) => setLocationID(e.target.value)}
            fullWidth
            required
          />

          <FormControl fullWidth required>
            <InputLabel id="account-type-label">Account Type</InputLabel>
            <Select
              labelId="account-type-label"
              label="Account Type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <MenuItem value="Parent">Parent</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            helperText="Password must include 1 uppercase, 1 lowercase, and 1 symbol (!@#$)."
          />

          <TextField
            label="Re-enter Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              py: 1.5,
            }}
            fullWidth
          >
            Sign Up
          </Button>

          <Link href="/login" passHref>
            <Typography
              variant="body2"
              sx={{
                color: "#3498db",
                mt: 2,
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Already have an account?
            </Typography>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
