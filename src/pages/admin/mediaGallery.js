import { useState, useEffect } from 'react';
import { Button, Dialog, DialogContent, Typography, DialogActions, Snackbar, Alert } from '@mui/material';
import Image from 'next/image';
import styles from '../HomePage.module.css';
import { fetchMediaByLocationID, fetchPaginatedMedia, deleteMediaByMediaID } from '../../utils/mediaAPI';
import { getCurrentUser } from '../../utils/api';

const AdminMediaGallery = () => {
  const [locationID, setLocationID] = useState('');
  const [page, setPage] = useState(1);
  const [mediaEntries, setMediaEntries] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState('');
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

        const entries = await fetchMediaByLocationID(userLocationID);
        setMediaEntries(entries);
        fetchPaginatedMediaFiles(entries, 1);
      } catch (err) {
        setError("Failed to load media files.");
        setSnackbar({ open: true, message: 'Failed to load media files.', severity: 'error' });
      }
    };

    fetchData();
  }, []);

  const fetchPaginatedMediaFiles = async (entries, pageNumber) => {
    try {
      const files = await fetchPaginatedMedia(entries, pageNumber);
      setMediaFiles(files);
    } catch (err) {
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
        setError("Failed to delete media.");
        setSnackbar({ open: true, message: 'Failed to delete media.', severity: 'error' });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatSize = (sizeInBytes) => `${(sizeInBytes / 1024).toFixed(2)} KB`;

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
        Media Gallery Lookup
      </Typography>

      {error && (
        <Typography variant="body1" align="center" sx={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </Typography>
      )}

      <div className={styles.mediaList} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
        {mediaFiles.length > 0 ? (
          mediaFiles.map((file, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
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
              <Typography variant="body2">{truncateText(file.mediaID, 30)}</Typography>
            </div>
          ))
        ) : (
          <Typography variant="body1" sx={{ color: 'red', marginTop: '10px' }}>
            No results found.
          </Typography>
        )}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <Button variant="outlined" onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </Button>
        <span>Page: {page}</span>
        <Button variant="outlined" onClick={handleNextPage} disabled={(page * pageLimit) >= mediaEntries.length}>
          Next
        </Button>
      </div>

      <Dialog open={!!selectedMedia} onClose={closeMediaModal} maxWidth="md">
        <DialogContent style={{ textAlign: 'center' }}>
          {selectedMedia && (
            <>
              {selectedMedia.mediaID.endsWith('.mp4') || selectedMedia.mediaID.endsWith('.mkv') ? (
                <video width="600" height="400" controls>
                  <source src={selectedMedia.url} type={`video/${selectedMedia.mediaID.split('.').pop()}`} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image src={selectedMedia.url} alt={selectedMedia.mediaID} width={600} height={700} />
              )}
              <Typography variant="body1" sx={{ marginTop: '10px' }}>
                <strong>Media ID:</strong> {selectedMedia.mediaID}
              </Typography>
              <Typography variant="body1">
                <strong>Description:</strong> {selectedMedia.description || 'No description available'}
              </Typography>
              <Typography variant="body1">
                <strong>Location ID:</strong> {selectedMedia.locationID}
              </Typography>
              <Typography variant="body1">
                <strong>Uploaded By:</strong> {selectedMedia.uploadedBy}
              </Typography>
              <Typography variant="body1">
                <strong>Child ID:</strong> {selectedMedia.childID}
              </Typography>
              <Typography variant="body1">
                <strong>Last Modified:</strong>{' '}
                {selectedMedia.LastModified ? new Date(selectedMedia.LastModified).toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Size:</strong> {selectedMedia.Size ? formatSize(selectedMedia.Size) : 'N/A'}
              </Typography>
              <Button variant="contained" color="secondary" sx={{ marginTop: '20px' }} onClick={openDeleteConfirm}>
                Delete
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onClose={closeDeleteConfirm}>
        <DialogContent>
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            Are you sure you want to delete this media file?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminMediaGallery;
