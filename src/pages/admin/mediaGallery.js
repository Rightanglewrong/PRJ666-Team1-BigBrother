import { useState, useEffect } from 'react';
import { Button, Dialog, DialogContent, Typography, DialogActions, Snackbar, Alert } from '@mui/material';
import Image from 'next/image';
import styles from '../HomePage.module.css';
import { fetchMediaByLocationID, fetchPaginatedMedia, deleteMediaByMediaID } from '../../utils/mediaAPI';
import { getCurrentUser } from '../../utils/api';

const AdminMediaGallery = () => {
  const [locationID, setLocationID] = useState('');
  const [defaultLocationID, setDefaultLocationID] = useState('');
  const [page, setPage] = useState(1);
  const [mediaEntries, setMediaEntries] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const pageLimit = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        const userLocationID = user.locationID.toUpperCase();
        setLocationID(userLocationID);
        setDefaultLocationID(userLocationID); // Save the default location ID

        // Automatically fetch media for the user's location ID
        const entries = await fetchMediaByLocationID(userLocationID);
        setMediaEntries(entries);
        setShowResults(true);
        fetchPaginatedMediaFiles(entries, 1);
      } catch (err) {
        console.error("Failed to fetch media by location ID:", err);
        setError("Failed to load media files.");
        setSnackbar({ open: true, message: 'No results found.', severity: 'error' });
      }
    };

    fetchData();
    setIsClient(true);
  }, []);

  const fetchPaginatedMediaFiles = async (entries, pageNumber) => {
    try {
      const files = await fetchPaginatedMedia(entries, pageNumber);
      setMediaFiles(files);
      setError('');
    } catch (err) {
      //console.error("Failed to fetch paginated media:", err);
      setError("Failed to load paginated media files.");
      setSnackbar({ open: true, message: 'Failed to load paginated media files.', severity: 'error' });
    }
  };

  const handleNextPage = () => {
    const nextPage = page + 1;
    if ((nextPage - 1) * pageLimit < mediaEntries.length) {
      setPage(nextPage);
      fetchPaginatedMediaFiles(mediaEntries, nextPage);
    }
  };

  const handlePreviousPage = () => {
    const prevPage = Math.max(page - 1, 1);
    setPage(prevPage);
    fetchPaginatedMediaFiles(mediaEntries, prevPage);
  };

  const openMediaModal = (file) => setSelectedMedia(file);

  const closeMediaModal = () => setSelectedMedia(null);

  const formatSize = (sizeInBytes) => `${(sizeInBytes / 1024).toFixed(2)} KB`;

  const openDeleteConfirm = () => setIsDeleteConfirmOpen(true);

  const closeDeleteConfirm = () => setIsDeleteConfirmOpen(false);

  const handleDelete = async () => {
    if (selectedMedia) {
      try {
        const s3Key = `${selectedMedia.locationID}/${selectedMedia.uploadedBy}/${selectedMedia.mediaID}`;
        await deleteMediaByMediaID(selectedMedia.mediaID, s3Key);

        const updatedEntries = mediaEntries.filter(entry => entry.mediaID !== selectedMedia.mediaID);
        setMediaEntries(updatedEntries);
        closeMediaModal();
        closeDeleteConfirm();

        const newPage = updatedEntries.length < (page - 1) * pageLimit + 1 ? page - 1 : page;
        setPage(newPage);
        fetchPaginatedMediaFiles(updatedEntries, newPage);
      } catch (error) {
        //console.error("Error deleting media:", error);
        setError("Failed to delete media.");
        setSnackbar({ open: true, message: 'Failed to delete media.', severity: 'error' });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!isClient) return null;

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {/* Title Section */}
      <Typography
        variant="h4"
        align="center"
        sx={{
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '20px',
          marginTop: '20px',
        }}
      >
        Media Gallery Lookup
      </Typography>
  
      {/* Error Message */}
      {error && (
        <Typography
          variant="body1"
          align="center"
          sx={{ color: 'red', marginBottom: '10px' }}
        >
          {error}
        </Typography>
      )}
  
      {/* Results Section */}
      {showResults && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <div
            className={styles.mediaList}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '10px',
            }}
          >
            {mediaFiles.length > 0 ? (
              mediaFiles.map((file, index) => (
                <div key={index} className={styles.mediaItem} style={{ textAlign: 'center' }}>
                  {file.mediaID.endsWith('.mp4') || file.mediaID.endsWith('.mkv') ? (
                    <Image
                      src="/icons/videoIcon.png"
                      alt={`Media ID: ${file.mediaID}`}
                      width={200}
                      height={200}
                      style={{ cursor: 'pointer' }}
                      onClick={() => openMediaModal(file)}
                    />
                  ) : (
                    <Image
                      src={file.url}
                      alt={`Media ID: ${file.mediaID}`}
                      width={200}
                      height={200}
                      style={{ cursor: 'pointer' }}
                      onClick={() => openMediaModal(file)}
                    />
                  )}
                  <p>{file.mediaID.length > 30 ? `${file.mediaID.substring(0, 30)}...` : file.mediaID}</p>
                </div>
              ))
            ) : (
              <Typography
                variant="body1"
                align="center"
                sx={{ color: 'red', marginTop: '10px' }}
              >
                No results found.
              </Typography>
            )}
          </div>
  
          {/* Pagination */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button variant="outlined" onClick={handlePreviousPage} disabled={page === 1}>
              Previous
            </Button>
            <span>Page: {page}</span>
            <Button
              variant="outlined"
              onClick={handleNextPage}
              disabled={(page * pageLimit) >= mediaEntries.length}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  
}
export default AdminMediaGallery;
