'use client';

import { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import styles from '../HomePage.module.css';
import { getPaginatedMediaByLocation } from '../../utils/mediaAPI';

const MediaGallery = () => {
  const [locationID, setLocationID] = useState('');
  const [page, setPage] = useState(1);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showResults, setShowResults] = useState(false);

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
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
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
    </div>
  );
};

export default MediaGallery;
