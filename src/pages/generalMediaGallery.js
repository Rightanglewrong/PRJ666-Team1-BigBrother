import { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogContent, Typography, DialogActions, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import Image from 'next/image';
import styles from './HomePage.module.css';
import { fetchMediaByUserID, fetchPaginatedMedia, deleteMediaByMediaID } from '../utils/mediaAPI';
import { retrieveChildProfileByID } from '../utils/childAPI';
import { useRouter } from 'next/router';

const MediaGallery = () => {
  const [page, setPage] = useState(1);
  const [mediaEntries, setMediaEntries] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChildID, setSelectedChildID] = useState('');
  
  const isInitialMount = useRef(true);
  const pageLimit = 3;
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('token');
    if (token && isInitialMount.current) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userID = decodedToken.userID;
      if (userID) {
        handleAutoSubmit(userID);
      }
      isInitialMount.current = false; // Mark as not the initial mount
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleAutoSubmit = async (userID) => {
    setPage(1);
    try {
      const entries = await fetchMediaByUserID(userID);
      console.log(entries);
      setMediaEntries(entries);
      setShowResults(true);

      // Fetch child profiles based on childID
      const profiles = [];
      for (const entry of entries) {
        const profile = await retrieveChildProfileByID(entry.childID);
        if (profile) {
          profiles.push({ childID: entry.childID, firstName: profile.child.child.firstName });
          //console.log(profile.child.child.firstName);
        }
      }

      // Remove duplicate child profiles
      const uniqueProfiles = Array.from(new Set(profiles.map(JSON.stringify))).map(JSON.parse);
      console.log("Unique Child Profiles:", uniqueProfiles); // Debugging log to see child profiles
      setChildProfiles(uniqueProfiles);
    } catch (err) {
      console.error("Failed to fetch media by user ID:", err);
      setError("Failed to load media files.");
    }
  };

  const handleChildSelect = (childID) => {
    setSelectedChildID(childID);
    setPage(1);
    const filteredEntries = mediaEntries.filter(entry => entry.childID === childID);
    fetchPaginatedMediaFiles(filteredEntries, 1);
  };

  const fetchPaginatedMediaFiles = async (entries, pageNumber) => {
    try {
      const files = await fetchPaginatedMedia(entries, pageNumber);
      setMediaFiles(files);
      setError('');
    } catch (err) {
      console.error("Failed to fetch paginated media:", err);
      setError("Failed to load paginated media files.");
    }
  };

  const handleNextPage = () => {
    const nextPage = page + 1;
    if ((nextPage - 1) * pageLimit < mediaEntries.length) {
      setPage(nextPage);
      const filteredEntries = mediaEntries.filter(entry => entry.childID === selectedChildID);
      fetchPaginatedMediaFiles(filteredEntries, nextPage);
    }
  };

  const handlePreviousPage = () => {
    const prevPage = Math.max(page - 1, 1);
    setPage(prevPage);
    const filteredEntries = mediaEntries.filter(entry => entry.childID === selectedChildID);
    fetchPaginatedMediaFiles(filteredEntries, prevPage);
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
        const filteredEntries = updatedEntries.filter(entry => entry.childID === selectedChildID);
        fetchPaginatedMediaFiles(filteredEntries, newPage);
      } catch (error) {
        console.error("Error deleting media:", error);
        setError("Failed to delete media.");
      }
    }
  };

  if (!isClient) return null;

  return (
    <div className={styles.homeContainer}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className={styles.title}>Media Gallery Lookup</h1>

        {childProfiles.length > 0 && (
          <FormControl style={{ marginBottom: '20px', minWidth: '200px' }}>
            <InputLabel id="select-child-label">Select Child</InputLabel>
            <Select
              labelId="select-child-label"
              value={selectedChildID}
              onChange={(e) => handleChildSelect(e.target.value)}
              label="Select Child"
            >
              {childProfiles.map((profile, index) => (
                <MenuItem key={index} value={profile.childID}>
                  {profile.firstName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {showResults && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.mediaList} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
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
                <p>No media files found.</p>
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
          </div>
        )}
      </div>

      {/* Media Modal */}
      <Dialog open={!!selectedMedia} onClose={closeMediaModal} maxWidth="md">
        <DialogContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {selectedMedia && (
            <>
              {selectedMedia.mediaID.endsWith('.mp4') || selectedMedia.mediaID.endsWith('.mkv') ? (
                <video width="600" height="400" controls>
                  <source src={selectedMedia.url} type={`video/${selectedMedia.mediaID.split('.').pop()}`} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image src={selectedMedia.url} alt={`Enlarged Media ID: ${selectedMedia.mediaID}`} width={600} height={700} />
              )}
              <Typography variant="body1" style={{ marginTop: '10px', textAlign: 'center' }}>
                <strong>Media ID:</strong> {selectedMedia.mediaID}
              </Typography>
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                <strong>Description:</strong> {selectedMedia.description || 'No description available'}
              </Typography>
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                <strong>Location ID:</strong> {selectedMedia.locationID}
              </Typography>
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                <strong>Uploaded By:</strong> {selectedMedia.uploadedBy}
              </Typography>
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                <strong>Child ID:</strong> {selectedMedia.childID}
              </Typography>
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                <strong>Last Modified:</strong> {selectedMedia.LastModified ? new Date(selectedMedia.LastModified).toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                <strong>Size:</strong> {selectedMedia.Size ? formatSize(selectedMedia.Size) : 'N/A'}
              </Typography>
              <Button variant="contained" color="secondary" style={{ marginTop: '20px' }} onClick={openDeleteConfirm}>
                Delete
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
