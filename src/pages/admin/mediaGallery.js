'use client';

import { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogContent, Typography, DialogActions } from '@mui/material';
import styles from '../HomePage.module.css';
import { getPaginatedMediaByLocation, deleteMediaByMediaID, fetchMediaByLocationID, fetchPaginatedMedia } from '../../utils/mediaAPI';

const MediaGallery = () => {
  const [locationID, setLocationID] = useState('');
  const [page, setPage] = useState(1);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const pageLimit = 3; // Number of media files per page

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new location ID search
    await fetchMediaFiles(1); // Fetch the first page of results
    setShowResults(true); // Show results after submit
  };

  const fetchMediaFiles = async (pageNumber) => {
    try {
      const files = await getPaginatedMediaByLocation(locationID, pageNumber);
      setMediaFiles(files);
      setError('');
      setHasMore(files.length === pageLimit); // Check if we have more pages
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError('Failed to load media files.');
    }
  };

  const handleNextPage = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchMediaFiles(nextPage);
  };

  const handlePreviousPage = async () => {
    const prevPage = Math.max(page - 1, 1);
    setPage(prevPage);
    await fetchMediaFiles(prevPage);
  };

  const openImageModal = (file) => {
    setSelectedImage(file);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const formatSize = (sizeInBytes) => {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  };

  const openDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (selectedImage) {
      console.log("Selected mediaID for deletion:", selectedImage.mediaID); // Debugging line
      try {
        // Step 1: Delete the selected media item
        await deleteMediaByMediaID(selectedImage.mediaID);
        closeImageModal();
        closeDeleteConfirm();
  
        // Step 2: Re-fetch all the media entries by location ID
        const mediaEntries = await fetchMediaByLocationID(locationID);
  
        // Step 3: Adjust the page if necessary (e.g., when deleting the last item on the current page)
        const totalItems = mediaEntries.length;
        const totalPages = Math.ceil(totalItems / pageLimit);
        const newPage = Math.min(page, totalPages);
  
        // Step 4: Fetch the updated media for the current page
        const paginatedMedia = await fetchPaginatedMedia(mediaEntries, newPage);
        
        // Update state with new media and page details
        setMediaFiles(paginatedMedia);
        setPage(newPage);
  
        // Step 5: Update `hasMore` based on the number of items remaining
        setHasMore(mediaEntries.length > newPage * pageLimit);
  
      } catch (error) {
        console.error("Error deleting media:", error);
        setError('Failed to delete media.');
      }
    }
  };
  

  if (!isClient) return null;

  return (
    <div className={styles.homeContainer}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className={styles.title}>Media Gallery Lookup</h1>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            marginTop: '10px',
          }}
        >
          <TextField
            label="Location ID"
            variant="outlined"
            value={locationID}
            onChange={(e) => setLocationID(e.target.value)}
            style={{ width: '300px' }}
          />
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </form>

        {showResults && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {error && <p className={styles.error}>{error}</p>}

            <div
              className={styles.mediaList}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '20px',
              }}
            >
              {mediaFiles.length > 0 ? (
                mediaFiles.map((file, index) => (
                  <div key={index} className={styles.mediaItem} style={{ textAlign: 'center' }}>
                    {file.url ? (
                      <img
                        src={file.url}
                        alt={`Media ID: ${file.mediaID}`}
                        style={{ maxWidth: '200px', maxHeight: '200px', cursor: 'pointer' }}
                        onClick={() => openImageModal(file)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <p>Image data missing for {file.mediaID}</p>
                    )}
                    <p>{file.mediaID}</p>
                  </div>
                ))
              ) : (
                <p>No media files found.</p>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Button
                variant="outlined"
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span>Page: {page}</span>
              <Button
                variant="outlined"
                onClick={handleNextPage}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for enlarged image */}
      <Dialog open={!!selectedImage} onClose={closeImageModal} maxWidth="md">
        <DialogContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {selectedImage && (
            <>
              <img
                src={selectedImage.url}
                alt={`Enlarged Media ID: ${selectedImage.mediaID}`}
                style={{ maxWidth: '100%', maxHeight: '80vh' }}
              />
              <Typography variant="body1" style={{ marginTop: '10px', textAlign: 'center' }}>
                <strong>Media ID:</strong> {selectedImage.mediaID}
              </Typography>
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                <strong>Last Modified:</strong> {selectedImage.LastModified ? new Date(selectedImage.LastModified).toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                <strong>Size:</strong> {selectedImage.Size ? formatSize(selectedImage.Size) : 'N/A'}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                style={{ marginTop: '20px' }}
                onClick={openDeleteConfirm}
              >
                Delete
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for delete action */}
      <Dialog open={isDeleteConfirmOpen} onClose={closeDeleteConfirm}>
        <DialogContent>
          <Typography variant="body1" style={{ textAlign: 'center' }}>
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
    </div>
  );
};

export default MediaGallery;
