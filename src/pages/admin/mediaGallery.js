import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  Typography,
  DialogActions,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Box,
  Container,
} from '@mui/material';
import Image from 'next/image';
import styles from '../HomePage.module.css';
import { fetchMediaByLocationID, fetchPaginatedMedia, deleteMediaByMediaID } from '../../utils/mediaAPI';
import { getCurrentUser } from '../../utils/api';
import { useTheme } from '@/components/ThemeContext';

const AdminMediaGallery = () => {
  const { darkMode, colorblindMode } = useTheme(); // Access theme modes
  const [locationID, setLocationID] = useState('');
  const [page, setPage] = useState(1);
  const [mediaEntries, setMediaEntries] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [handMode, setHandMode] = useState('none');

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

        // Load `handMode` from localStorage
        const storedHandMode = localStorage.getItem('handMode') || 'none';
        setHandMode(storedHandMode);
      } catch (err) {
        setError("Failed to load media files.");
      }
    };

    fetchData();
    setIsClient(true);
  }, []);

  const fetchPaginatedMediaFiles = async (entries, pageNumber) => {
    try {
      const files = await fetchPaginatedMedia(entries, pageNumber);
      setMediaFiles(files);
    } catch (err) {
      setError("Failed to load paginated media files.");
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
      }
    }
  };

  const formatSize = (sizeInBytes) => `${(sizeInBytes / 1024).toFixed(2)} KB`;

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const buttonColors = {
    original: { primary: '#1976d2', secondary: '#f44336' },
    'red-green': { primary: '#1565c0', secondary: '#cc6f1f' },
    'blue-yellow': { primary: '#6a0dad', secondary: '#d32f2f' },
  };

  if (!isClient) return null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: darkMode ? '#121212' : '#f7f9fc',
        color: darkMode ? '#f1f1f1' : '#333',
        py: 4,
      }}
    >
    <Container maxWidth="md">
      <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
        Media Gallery Lookup
      </Typography>

      {error && (
        <Typography variant="body1" align="center" sx={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </Typography>
      )}

      <div
        className={styles.mediaList}
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}
      >
        {mediaFiles.length > 0 ? (
          mediaFiles.map((file, index) => (
            <Card
              key={index}
              style={{ width: 250, cursor: 'pointer' }}
              onClick={() => openMediaModal(file)}
            >
              <CardMedia
                component={file.mediaID.endsWith('.mp4') || file.mediaID.endsWith('.mkv') ? 'img' : 'img'}
                image={
                  file.mediaID.endsWith('.mp4') || file.mediaID.endsWith('.mkv')
                    ? '/icons/videoIcon.png'
                    : file.url
                }
                alt={`Media ID: ${file.mediaID}`}
                height="140"
              />
              <CardContent>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  {truncateText(file.mediaID, 30)}
                </Typography>
              </CardContent>
            </Card>
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

      {/* Modal and Dialog Components */}
      <Dialog
  open={!!selectedMedia}
  onClose={closeMediaModal}
  maxWidth="lg"
  fullWidth
  PaperProps={{
    sx: {
      m: 0, // Removes outer margin
      overflow: 'hidden', // Prevents content overflow outside modal
      height: '90vh', // Ensures the modal doesn't exceed 90% of viewport height
    },
  }}
>
  <DialogContent
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', // Ensures content starts from the top
      p: 2,
      overflowY: 'auto', // Enables vertical scrolling if content overflows
      height: '100%', // Fills the modal space
    }}
  >
    {selectedMedia && (
      <>
        {selectedMedia.mediaID.endsWith('.mp4') || selectedMedia.mediaID.endsWith('.mkv') ? (
          <video
            controls
            style={{
              width: '100%',
              maxWidth: '600px', // Restricts width on larger screens
              maxHeight: '50vh', // Prevents video from exceeding half of viewport height
              objectFit: 'contain',
            }}
          >
            <source src={selectedMedia.url} type={`video/${selectedMedia.mediaID.split('.').pop()}`} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={selectedMedia.url}
            alt={selectedMedia.mediaID}
            layout="intrinsic"
            width={800}
            height={600}
            style={{
              width: '100%',
              maxWidth: '600px', // Restricts width on larger screens
              maxHeight: '50vh', // Ensures image doesn't exceed half of viewport height
              objectFit: 'contain',
            }}
          />
        )}
        <Typography variant="body1" sx={{ marginTop: '10px', textAlign: 'center' }}>
          <strong>Media ID:</strong> {selectedMedia.mediaID}
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          <strong>Description:</strong> {selectedMedia.description || 'No description available'}
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          <strong>Location ID:</strong> {selectedMedia.locationID}
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          <strong>Uploaded By:</strong> {selectedMedia.uploadedBy}
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          <strong>Child ID:</strong> {selectedMedia.childID}
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          <strong>Last Modified:</strong>{' '}
          {selectedMedia.LastModified ? new Date(selectedMedia.LastModified).toLocaleString() : 'N/A'}
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          <strong>Size:</strong> {selectedMedia.Size ? formatSize(selectedMedia.Size) : 'N/A'}
        </Typography>
        <Button variant="contained" color="secondary" sx={{ marginTop: '20px' }} onClick={openDeleteConfirm}>
          Delete
        </Button>
      </>
    )}
  </DialogContent>
</Dialog>

<Dialog
  open={isDeleteConfirmOpen}
  onClose={closeDeleteConfirm}
  maxWidth="sm"
  PaperProps={{
    sx: {
      m: 2,
      padding: 2,
    },
  }}
>
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
    </Container>
    </Box>
  );
};

export default AdminMediaGallery;
