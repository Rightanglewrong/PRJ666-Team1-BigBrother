import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/hoc/withAuth';
import styles from './media.module.css';
import { getRelationshipByParentID } from '../utils/relationshipAPI';
import { getCurrentUser } from '../utils/api';
import { retrieveChildProfileByID } from '../utils/childAPI';
import { uploadMedia } from '../utils/mediaAPI';
import { Select, MenuItem, Dialog, DialogContent, Typography, Button } from '@mui/material';

const MediaUploadPage = () => {
  const [childID, setChildID] = useState('');
  const [description, setDescription] = useState('');
  const [childProfiles, setChildProfiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [file, setFile] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const fileInputRef = useRef(null); // Create a ref for the file input
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
            setShowErrorPopup(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Failed to load child profiles.");
        setShowErrorPopup(true);
      }
    };

    fetchUserDetails();
  }, [router]);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
  
    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrorMessage("Only JPEG, JPG, PNG, and MP4 files are allowed.");
        setShowErrorPopup(true);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input field
      } else if (selectedFile.size > maxFileSize) {
        setErrorMessage("File size must be 10MB or less.");
        setShowErrorPopup(true);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input field
      } else {
        setErrorMessage(null);
        setFile(selectedFile);
      }
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (description.length > 150) {
      setErrorMessage("Description must be 150 characters or fewer.");
      setShowErrorPopup(true);
      return;
    }

    try {
      if (!file || !childID) {
        setErrorMessage("Please select a file and a child.");
        setShowErrorPopup(true);
        return;
      }

      const uploadedMedia = await uploadMedia(file, childID, description);

      console.log("Media uploaded successfully:", uploadedMedia);
      setErrorMessage(null);
      setChildID('');
      setDescription('');
      setFile(null);

      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error uploading media:", error);
      setErrorMessage("Failed to upload media.");
      setShowErrorPopup(true);
    }
  };

  const handleCancel = () => {
    setChildID('');
    setDescription('');
    setFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input field
  };

  return (
    <div className={styles.mediaUploadPage}>
      <h1 className={styles.title}>Upload Picture/Video</h1>
      <form className={styles.mediaUploadForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Choose Files to Upload</label>
          <input
            type="file"
            onChange={handleFileUpload}
            className={styles.formInputFile}
            ref={fileInputRef} // Attach ref to file input
          />
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
            maxLength="150"
          />
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.buttonUpload}>Upload</button>
          <button type="button" className={styles.buttonCancel} onClick={handleCancel}>Cancel</button>
        </div>
      </form>

      {/* Success popup */}
      <Dialog open={showSuccessPopup} onClose={() => setShowSuccessPopup(false)}>
        <DialogContent style={{ textAlign: 'center', padding: '20px' }}>
          <Typography variant="h6" color="primary">
            Upload Successful!
          </Typography>
          <Button onClick={() => setShowSuccessPopup(false)} color="primary" style={{ marginTop: '15px' }}>
            OK
          </Button>
        </DialogContent>
      </Dialog>

      {/* Error popup */}
      <Dialog open={showErrorPopup} onClose={() => setShowErrorPopup(false)}>
        <DialogContent style={{ textAlign: 'center', padding: '20px' }}>
          <Typography variant="h6" color="error">
            {errorMessage}
          </Typography>
          <Button onClick={() => setShowErrorPopup(false)} color="primary" style={{ marginTop: '15px' }}>
            OK
          </Button>
        </DialogContent>
      </Dialog>

      <footer className={styles.mediaFooter}>
        <a href="/contacts" className={styles.footerLink}>Contacts</a>
        <a href="/terms" className={styles.footerLink}>Terms of Service</a>
      </footer>
    </div>
  );
};

export default withAuth(MediaUploadPage);
