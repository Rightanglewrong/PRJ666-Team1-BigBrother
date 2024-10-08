import { useState, useEffect } from "react";
import { getCurrentUser } from "../utils/api"; // Use getCurrentUser instead of getUserProfile
import { updateUserProfile } from '../utils/api';
import styles from "./profile.module.css";

export default function ProfilePage() {
  const [userID, setUserID] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [locationID, setLocationID] = useState("");
  const [accountType, setAccountType] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user profile data when the component mounts
  useEffect(() => {
    async function fetchProfile() {
      try {
        const userProfile = await getCurrentUser(); // Fetch user data using getCurrentUser
        setUserID(userProfile.userID); // Set userID
        setEmail(userProfile.email); // Set email
        setFirstName(userProfile.firstName); // Set first name
        setLastName(userProfile.lastName); // Set last name
        setLocationID(userProfile.locationID); // Set location ID
        setAccountType(userProfile.accountType); // Set account type
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to load profile");
      }
    }

    fetchProfile();
  }, []);

  // Handle form submission to update user info
  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedData = {
      firstName,
      lastName,
      locationID,
      accountType,
    };

    try {
      await updateUserProfile(updatedData); // Assume this sends updated data to backend
      setSuccess("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile", err);
      setError("Failed to update profile");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Profile</h1>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <form className={styles.form} onSubmit={handleUpdate}>
        {/* UserID - Uneditable */}
        <label className={styles.label}>User ID</label>
        <input className={styles.input} type="text" value={userID} disabled />

        {/* Email - Uneditable */}
        <label className={styles.label}>Email</label>
        <input className={styles.input} type="email" value={email} disabled />

        {/* First Name */}
        <label className={styles.label}>First Name</label>
        <input
          className={styles.input}
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        {/* Last Name */}
        <label className={styles.label}>Last Name</label>
        <input
          className={styles.input}
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        {/* Location ID */}
        <label className={styles.label}>Location ID</label>
        <input
          className={styles.input}
          type="text"
          value={locationID}
          onChange={(e) => setLocationID(e.target.value)}
        />

        {/* Account Type */}
        <label className={styles.label}>Account Type</label>
        <select
          className={styles.input}
          id="accountType"
          name="accountType"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          required
        >
          <option value="Parent">Parent</option>
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
        </select>

        {/* Submit Button */}
        <button className={styles.button} type="submit">
          Update Info
        </button>
      </form>
    </div>
  );
}
