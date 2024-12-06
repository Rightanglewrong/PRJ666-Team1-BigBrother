import { useState, useEffect, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import Image from 'next/image';
import styles from './HomePage.module.css';
import { fetchMediaByUserID, fetchPaginatedMedia, deleteMediaByMediaID } from '../utils/mediaAPI';
import { retrieveChildProfileByID } from '../utils/childAPI';
import { useRouter } from 'next/router';

const MediaGallery = () => {
  const [page, setPage] = useState(1);
  const [mediaEntries, setMediaEntries] = useState([]);
  const [filteredMediaEntries, setFilteredMediaEntries] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
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
      isInitialMount.current = false;
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleAutoSubmit = async (userID) => {
    setPage(1);
    try {
      const entries = await fetchMediaByUserID(userID);
      setMediaEntries(entries);
      setShowResults(true);

      const profiles = [];
      for (const entry of entries) {
        const profile = await retrieveChildProfileByID(entry.childID);
        if (profile) {
          profiles.push({ childID: entry.childID, firstName: profile.child.child.firstName, lastName: profile.child.child.lastName });
        }
      }

      const uniqueProfiles = Array.from(new Set(profiles.map(JSON.stringify))).map(JSON.parse);
      setChildProfiles(uniqueProfiles);
    } catch (err) {
      setError("Failed to load media files.");
    }
  };

  const handleChildSelect = (childID) => {
    setSelectedChildID(childID);
    setPage(1);
    const filteredEntries = mediaEntries.filter(entry => entry.childID === childID);
    setFilteredMediaEntries(filteredEntries);
    fetchPaginatedMediaFiles(filteredEntries, 1);
  };

  const fetchPaginatedMediaFiles = async (entries, pageNumber) => {
    try {
      const files = await fetchPaginatedMedia(entries, pageNumber);
      setMediaFiles(files);
      setError('');
    } catch (err) {
      setError("Failed to load paginated media files.");
    }
  };

  const openMediaModal = (file) => {
    setSelectedMedia(file);
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
  };

  const handleNextPage = () => {
    const nextPage = page + 1;
    if ((nextPage - 1) * pageLimit < filteredMediaEntries.length) {
      setPage(nextPage);
      fetchPaginatedMediaFiles(filteredMediaEntries, nextPage);
    }
  };

  const handlePreviousPage = () => {
    const prevPage = Math.max(page - 1, 1);
    setPage(prevPage);
    fetchPaginatedMediaFiles(filteredMediaEntries, prevPage);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
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

      {childProfiles.length > 0 ? (
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
                {`${profile.lastName}, ${profile.firstName}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Typography variant="body1" color="error" style={{ marginBottom: '20px' }}>
          No child profile related to this account.
        </Typography>
      )}

      {showResults && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {error && (
            <Typography variant="body1" color="error" style={{ marginBottom: '10px' }}>
              {error}
            </Typography>
          )}
          <div
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
                <Card key={index} style={{ width: 250, cursor: 'pointer' }} onClick={() => openMediaModal(file)}>
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
                      {file.mediaID.length > 30 ? `${file.mediaID.substring(0, 30)}...` : file.mediaID}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body1" color="error" style={{ marginTop: '10px' }}>
                No media files found.
              </Typography>
            )}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button variant="outlined" onClick={handlePreviousPage} disabled={page === 1}>
              Previous
            </Button>
            <span>Page: {page}</span>
            <Button
              variant="outlined"
              onClick={handleNextPage}
              disabled={(page * pageLimit) >= filteredMediaEntries.length}
            >
              Next
            </Button>
          </div>
        </div>
      )}
<Dialog open={!!selectedMedia} onClose={closeMediaModal} maxWidth="md">
  <DialogContent
    sx={{
      textAlign: 'center',
      width: '100%',
      mx: 'auto', // Center horizontally
    }}
  >
    {selectedMedia && (
      <>
        {selectedMedia.mediaID.endsWith('.mp4') || selectedMedia.mediaID.endsWith('.mkv') ? (
          <video
            style={{
              width: '100%', // Adjust to modal width
              height: 'auto', // Maintain aspect ratio
            }}
            controls
          >
            <source src={selectedMedia.url} type={`video/${selectedMedia.mediaID.split('.').pop()}`} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={selectedMedia.url}
            alt={`Enlarged Media ID: ${selectedMedia.mediaID}`}
            width={600}
            height={700}
            style={{
              maxWidth: '100%', // Make the image responsive
              height: 'auto', // Maintain aspect ratio
            }}
          />
        )}
        <Typography variant="body1" sx={{ marginTop: '10px', textAlign: 'center' }}>
          <strong>Media ID:</strong> {selectedMedia.mediaID}
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          <strong>Description:</strong> {selectedMedia.description || 'No description available'}
        </Typography>
      </>
    )}
  </DialogContent>
</Dialog>


    </div>
  );
};

export default MediaGallery;
