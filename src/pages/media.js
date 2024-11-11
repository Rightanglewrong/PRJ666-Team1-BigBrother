import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/hoc/withAuth';
import styles from './media.module.css';
import { getRelationshipByParentID } from '../utils/relationshipAPI';
import { getCurrentUser } from '../utils/api';
import { retrieveChildProfileByID } from '../utils/childAPI';
import { uploadMedia } from '../utils/mediaAPI'; // Import uploadMedia function
import { Select, MenuItem } from '@mui/material';

const MediaUploadPage = () => {
  const [childID, setChildID] = useState('');
  const [description, setDescription] = useState('');
  const [childProfiles, setChildProfiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [file, setFile] = useState(null); // Store the selected file
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUserDetails(userData);
        if (userData) {
          const relationshipData = await getRelationshipByParentID(userData.userID);
          if (relationshipData && relationshipData.length > 0) {
            const childrenProfiles = await Promise.all(
              relationshipData.map(async (relation) => {
                const childProfile = await retrieveChildProfileByID(relation.childID);
                return { childID: relation.childID, firstName: childProfile.child.child.firstName };
              })
            );
            setChildProfiles(childrenProfiles);
          } else {
            setErrorMessage("No children found.");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Failed to load child profiles.");
      }
    };

    fetchUserDetails();
  }, [router]);

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]); // Save the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate description length
    if (description.length > 150) {
      setErrorMessage("Description must be 150 characters or fewer.");
      return;
    }

    try {
      if (!file || !childID) {
        setErrorMessage("Please select a file and a child.");
        return;
      }

      // Call the uploadMedia function with file, childID, and description
      const uploadedMedia = await uploadMedia(file, childID, description);

      console.log("Media uploaded successfully:", uploadedMedia);
      setErrorMessage(null);
      setChildID('');
      setDescription('');
      setFile(null);
      // Optional: Navigate to a success page or display success message
    } catch (error) {
      console.error("Error uploading media:", error);
      setErrorMessage("Failed to upload media.");
    }
  };

  const handleCancel = () => {
    setChildID('');
    setDescription('');
    setFile(null);
  };

  return (
    <div className={styles.mediaUploadPage}>
      <h1 className={styles.title}>Upload Picture/Video</h1>
      <form className={styles.mediaUploadForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Choose Files to Upload</label>
          <input type="file" onChange={handleFileUpload} className={styles.formInputFile} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Child Selection</label>
          <Select
            label="Select Child"
            value={childID}
            onChange={(e) => setChildID(e.target.value)}
            fullWidth
            displayEmpty
            required
          >
            <MenuItem value="">
              <em>Select a child</em>
            </MenuItem>
            {childProfiles.length > 0 ? (
              childProfiles.map((child) => (
                <MenuItem key={child.childID} value={child.childID}>
                  {child.firstName}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                No child found
              </MenuItem>
            )}
          </Select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description</label>
          <textarea
            placeholder="Enter description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.formInputTextarea}
            maxLength="150" // Enforce character limit
          />
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.buttonUpload}>Upload</button>
          <button type="button" className={styles.buttonCancel} onClick={handleCancel}>Cancel</button>
        </div>
      </form>
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
      <footer className={styles.mediaFooter}>
        <a href="/contacts" className={styles.footerLink}>Contacts</a>
        <a href="/terms" className={styles.footerLink}>Terms of Service</a>
      </footer>
    </div>
  );
}

export default withAuth(MediaUploadPage);
