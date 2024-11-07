// src/pages/newsletter/create.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createNewsletter } from "@/utils/newsletterAPI";
import { useUser } from "@/components/authenticate";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";

export default function CreateNewsletterPage() {
  const userDetails = useUser();
  const router = useRouter();
  const [newsletter, setNewsletter] = useState({
    title: "",
    content: "",
  });
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsletter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (
      userDetails.accountType !== "Admin" &&
      userDetails.accountType !== "Staff"
    ) {
      setMessage("User is not authorized to create a newsletter");
      return;
    }

    const locationID = userDetails.locationID;
    const publishedBy = `${userDetails.firstName} ${userDetails.lastName}`;
    const newsletterData = { ...newsletter, locationID, publishedBy };

    try {
      await createNewsletter(token, newsletterData);
      setMessage("Newsletter created successfully");
      setTimeout(() => {
        router.push("/newsletter");
      }, 1000);
    } catch (error) {
      setMessage(
        error.message.includes("403")
          ? "You do not have permission to create a newsletter."
          : "An error occurred while creating the newsletter"
      );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, p: 3, backgroundColor: "#f7f9fc", borderRadius: 2, boxShadow: 3, mb: 4, overflow: "hidden", }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: "#2c3e50", fontWeight: "bold" }}>
        Create Newsletter
      </Typography>

      {message && (
        <Snackbar
          open={Boolean(message)}
          autoHideDuration={6000}
          onClose={() => setMessage("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setMessage("")} severity="info" sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Title"
          name="title"
          value={newsletter.title}
          onChange={handleInputChange}
          required
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Content"
          name="content"
          value={newsletter.content}
          onChange={handleInputChange}
          required
          fullWidth
          multiline
          rows={6}
          variant="outlined"
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "#3498db",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#2980b9" },
          }}
          fullWidth
        >
          Create Newsletter
        </Button>
      </Box>

      <Box textAlign="center" mt={2}>
        <Button
          onClick={() => router.push("/newsletter")}
          variant="text"
          sx={{ color: "#3498db" }}
        >
          Back to Newsletter List
        </Button>
      </Box>
    </Container>
  );
}