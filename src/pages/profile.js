import { useState, useEffect } from "react";
import { useUser } from "@/components/authenticate";
import { updateUserProfile } from "../utils/api";
import { withAuth } from "@/hoc/withAuth";
import styles from "./Profile.module.css";

const ProfilePage = () => {
  const user = useUser();

  // Use context data to initialize fields
  const [userID] = useState(user?.userID || "")
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [locationID, setLocationID] = useState(user?.locationID || "");
  const [accountType] = useState(user?.accountType || ""); // Account type is uneditable
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        <input
          className={styles.input}
          type="text"
          value={userID}
          disabled
        />

        {/* Email - Uneditable */}
        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          value={user?.email}
          disabled
        />

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
        <select className={styles.input} value={accountType} disabled>
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
};

export default withAuth(ProfilePage); // Wrap the page with the HOC
