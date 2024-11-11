'use client';

import { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogContent, Typography, DialogActions } from '@mui/material';
import Image from 'next/image';
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

  const pageLimit = 3;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPage(1);
    await fetchMediaFiles(1);
    setShowResults(true);
  };

  const fetchMediaFiles = async (pageNumber) => {
    try {
      const files = await getPaginatedMediaByLocation(locationID, pageNumber);
      setMediaFiles(files);
      setError('');
      setHasMore(files.length === pageLimit);
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
      try {
        await deleteMediaByMediaID(selectedImage.mediaID);
        closeImageModal();
        closeDeleteConfirm();
        const mediaEntries = await fetchMediaByLocationID(locationID);
        const totalItems = mediaEntries.length;
        const totalPages = Math.ceil(totalItems / pageLimit);
        const newPage = Math.min(page, totalPages);
        const paginatedMedia = await fetchPaginatedMedia(mediaEntries, newPage);
        
        setMediaFiles(paginatedMedia);
        setPage(newPage);
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
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
            <div className={styles.mediaList} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
              {mediaFiles.length > 0 ? (
                mediaFiles.map((file, index) => (
                  <div key={index} className={styles.mediaItem} style={{ textAlign: 'center' }}>
                    {file.url ? (
                      <Image
                        src={file.url}
                        alt={`Media ID: ${file.mediaID}`}
                        width={200}
                        height={200}
                        style={{ cursor: 'pointer' }}
                        onClick={() => openImageModal(file)}
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
              <Button variant="outlined" onClick={handlePreviousPage} disabled={page === 1}>
                Previous
              </Button>
              <span>Page: {page}</span>
              <Button variant="outlined" onClick={handleNextPage} disabled={!hasMore}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedImage} onClose={closeImageModal} maxWidth="md">
        <DialogContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {selectedImage && (
            <>
              <Image
                src={selectedImage.url}
                alt={`Enlarged Media ID: ${selectedImage.mediaID}`}
                width={800}
                height={600}
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
              <Button variant="contained" color="secondary" style={{ marginTop: '20px' }} onClick={openDeleteConfirm}>
                Delete
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

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
