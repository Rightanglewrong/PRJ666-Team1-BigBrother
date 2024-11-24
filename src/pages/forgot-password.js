import React, { useState } from "react";
import { useRouter } from "next/router"; // Import useRouter
import { forgotPassword } from "../utils/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize router

  const validateEmail = (email) => {
    // Regular expression to check for an email with "@" and "."
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (email !== confirmEmail) {
      setError("Emails do not match. Please try again.");
      return;
    }

    setError(""); // Clear any existing errors

    try {
      await forgotPassword(email); // Call the API with the email
      alert("Password reset email sent.");
    } catch (error) {
      // Show the same message regardless of success or failure
      console.error("Error sending password reset email:", error);
      alert("Password reset email sent to account.");
    }

    // Redirect to the login page
    router.push("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f7f7f7",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          textAlign: "center",
          padding: "20px",
          background: "#333",
          color: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Forgot Password</h1>
        {error && (
          <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>
        )}
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "5px",
            }}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label>Confirm Email:</label>
          <br />
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "5px",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "4px",
            background: "#007BFF",
            color: "white",
            border: "none",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
