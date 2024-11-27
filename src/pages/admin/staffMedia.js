import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/hoc/withAuth';
import styles from './staffMedia.module.css';
import { getCurrentUser } from '../../utils/api';
import { retrieveChildrenByLocationID } from '../../utils/childAPI';
import { uploadMedia } from '../../utils/mediaAPI';
import SnackbarNotification from '../../components/Modal/SnackBar'; // Import the SnackbarNotification component
import {
  Container,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { useTheme } from '@/components/ThemeContext';

const MediaUploadPage = () => {
  const [childID, setChildID] = useState('');
  const [description, setDescription] = useState('');
  const [childProfiles, setChildProfiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [file, setFile] = useState(null);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const { colorblindMode } = useTheme();

  const colors = {
    buttonSecondary: colorblindMode === 'red-green' ? '#e77f24' : '#f44336',
    buttonSecondaryHover: colorblindMode === 'red-green' ? '#cc6f1f' : '#d32f2f',
    buttonPrimary: colorblindMode === 'blue-yellow' ? '#6a0dad' : '#1976d2',
    buttonPrimaryHover: colorblindMode === 'blue-yellow' ? '#580c91' : '#1565c0',
  };

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

        if (userData && userData.locationID) {
          try {
            const childrenProfiles = await retrieveChildrenByLocationID(userData.locationID);
            if (childrenProfiles && childrenProfiles.length > 0) {
              setChildProfiles(
                childrenProfiles.map((child) => ({
                  childID: child.childID,
                  firstName: child.firstName,
                }))
              );
            } else {
              setErrorMessage('No children found for this location.');
              setShowErrorSnackbar(true);
            }
          } catch (error) {
            //console.error('Error retrieving children by location:', error);
            setErrorMessage('Failed to load child profiles for the location.');
            setShowErrorSnackbar(true);
          }
        } else {
          setErrorMessage('User location ID is not available.');
          setShowErrorSnackbar(true);
        }
      } catch (error) {
        //console.error('Error fetching user data:', error);
        setErrorMessage('Failed to load user details.');
        setShowErrorSnackbar(true);
      }
    };

    fetchUserDetails();
  }, [router]);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/x-matroska'];
    const maxFileSize = 10 * 1024 * 1024;

    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrorMessage('Only JPEG, JPG, PNG, MP4, and MKV files are allowed.');
        setShowErrorSnackbar(true);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else if (selectedFile.size > maxFileSize) {
        setErrorMessage('File size must be 10MB or less.');
        setShowErrorSnackbar(true);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setErrorMessage(null);
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (description.length > 150) {
      setErrorMessage('Description must be 150 characters or fewer.');
      setShowErrorSnackbar(true);
      return;
    }

    try {
      if (!file || !childID) {
        setErrorMessage('Please select a file and a child.');
        setShowErrorSnackbar(true);
        return;
      }

      const uploadedMedia = await uploadMedia(file, childID, description);

      //console.log('Media uploaded successfully:', uploadedMedia);
      setErrorMessage(null);
      setChildID('');
      setDescription('');
      setFile(null);

      setShowSuccessSnackbar(true);
      setTimeout(() => {
        setShowSuccessSnackbar(false);
        window.location.reload();
      }, 2000);
    } catch (error) {
      //console.error('Error uploading media:', error);
      setErrorMessage('Failed to upload media.');
      setShowErrorSnackbar(true);
    }
  };

  const handleCancel = () => {
    setChildID('');
    setDescription('');
    setFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCloseSnackbar = () => {
    setShowErrorSnackbar(false);
    setShowSuccessSnackbar(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 8, mb: 4, p: 3, backgroundColor: '#f7f9fc', borderRadius: 2 }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Upload Picture/Video
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Choose File
        </Typography>
        <input
          type="file"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Select Child
        </Typography>
        <Select
          value={childID}
          onChange={(e) => setChildID(e.target.value)}
          displayEmpty
          required
          fullWidth
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

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Description
        </Typography>
        <TextField
          placeholder="Enter description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          fullWidth
          inputProps={{ maxLength: 150 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: colors.buttonPrimary,
              '&:hover': { backgroundColor: colors.buttonPrimaryHover },
            }}
          >
            Upload
          </Button>
          <Button
            onClick={handleCancel}
            variant="contained"
            sx={{
              backgroundColor: colors.buttonSecondary,
              '&:hover': { backgroundColor: colors.buttonSecondaryHover },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>

      {/* Replace Snackbars with SnackbarNotification */}
      <SnackbarNotification
        open={showSuccessSnackbar}
        message="Upload Successful!"
        severity="success"
        onClose={handleCloseSnackbar}
      />
      <SnackbarNotification
        open={showErrorSnackbar}
        message={errorMessage}
        severity="error"
        onClose={handleCloseSnackbar}
      />
    </Container>
  );
};

export default withAuth(MediaUploadPage);
