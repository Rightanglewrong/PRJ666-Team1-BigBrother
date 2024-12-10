import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUsersByAccountTypeAndLocation } from '../../../utils/userAPI';
import { retrieveChildrenByLocationID } from '../../../utils/childAPI';
import { useUser } from '@/components/authenticate';
import { useTheme } from '@/components/ThemeContext'; // Import the Theme Context
import {
  Container,
  Typography,
  Select,
  Button,
  Alert,
  Box,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

export default function ParentAccountsLanding() {
  const router = useRouter();
  const user = useUser();
  const { darkMode, colorblindMode, handMode } = useTheme(); // Access theme modes
  const [parentID, setParentID] = useState('');
  const [childID, setChildID] = useState('');
  const [message, setMessage] = useState('');
  const [parentProfiles, setParentProfiles] = useState([]);
  const [childProfiles, setChildProfiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const baseColors = {
    background: darkMode ? '#121212' : '#ffffff',
    cardBackground: darkMode ? '#1e1e1e' : '#f5f5f5',
    text: darkMode ? '#f1f1f1' : '#333333',
    buttonPrimary: darkMode ? '#64b5f6' : '#1976d2',
    buttonPrimaryHover: darkMode ? '#42a5f5' : '#1565c0',
    buttonSecondary: darkMode ? '#81c784' : '#4caf50',
    buttonSecondaryHover: darkMode ? '#66bb6a' : '#388e3c',
  };

  const colorblindOverrides = {
    'red-green': {
      buttonPrimary: '#1976d2',
      buttonSecondary: '#e77f24',
      text: darkMode ? '#f1f1f1' : '#333333',
    },
    'blue-yellow': {
      buttonPrimary: '#e77f24',
      buttonSecondary: '#3db48c',
      text: darkMode ? '#f1f1f1' : '#333333',
    },
  };

  const colors = {
    ...baseColors,
    ...(colorblindMode !== 'none' ? colorblindOverrides[colorblindMode] : {}),
  };

  useEffect(() => {
    const fetchProfilesData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Unauthorized - please log in again.');
        }

        const parents = await getUsersByAccountTypeAndLocation('Parent', user.locationID);
        const sortedParents = (parents.users || []).sort((a, b) => 
            a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
        );
        setParentProfiles(sortedParents);
        
        const children = await retrieveChildrenByLocationID(user.locationID);
        const sortedChildren = (children || []).sort((a, b) => 
            a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
        );
        setChildProfiles(sortedChildren);
      } catch (error) {
        if (error.message.includes('Unauthorized')) {
          setMessage('Session expired. Redirecting to login...');
          localStorage.removeItem('token');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
        setParentProfiles([]);
        setChildProfiles([]);
      }
    };
    fetchProfilesData();
  }, [user, router]);

  const handleViewParentRelation = (e) => {
    e.preventDefault();
    if (!parentID) {
      setErrorMessage('Please select a parent before proceeding.');
      setOpenModal(true);
      return;
    }
    setErrorMessage(''); // Clear previous errors
    if (user.accountType === 'Admin') {
      router.push(`/admin/relationship/${parentID}?type=parent`);
    } else if (user.accountType === 'Staff') {
      router.push(`/relationship/${parentID}?type=parent`);
    }
  };

  const handleViewChildRelation = (e) => {
    e.preventDefault();
    if (!childID) {
      setErrorMessage('Please select a child before proceeding.');
      setOpenModal(true);
      return;
    }
    setErrorMessage(''); // Clear previous errors
    if (user.accountType === 'Admin') {
      router.push(`/admin/relationship/${childID}?type=child`);
    } else if (user.accountType === 'Staff') {
      router.push(`/relationship/${childID}?type=child`);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.background,
        color: colors.text,
        minHeight: '100vh',
        py: { xs: 'none', sm: 4 },
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          mt: { xs: 'none', sm: 4 },
          p: 3,
          backgroundColor: colors.cardBackground,
          color: colors.text,
          borderRadius: 2,
          boxShadow: 3,
          mb: 4,
          textAlign: handMode === 'left' ? 'left' : 'right',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Relationships
        </Typography>

        {message && (
          <Alert severity="info" onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Select
            label="Select Parent"
            value={parentID}
            onChange={(e) => setParentID(e.target.value)}
            fullWidth
            displayEmpty
            required
            sx={{ color: colors.text }}
          >
            <MenuItem value="">
              <em>Select an adult</em>
            </MenuItem>
            {Array.isArray(parentProfiles) && parentProfiles.length > 0 ? (
              parentProfiles.map((parent) => (
                <MenuItem key={parent.userID} value={parent.userID}>
                  {parent.firstName} {parent.lastName}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No parents available</MenuItem>
            )}
          </Select>

          <Button
            variant="contained"
            onClick={handleViewParentRelation}
            sx={{
              backgroundColor: colors.buttonPrimary,
              '&:hover': { backgroundColor: colors.buttonPrimaryHover },
              color: '#fff',
              textTransform: 'none',
            }}
          >
            View Adult&apos;s Relationships
          </Button>

          <Select
            label="Select Child"
            value={childID}
            onChange={(e) => setChildID(e.target.value)}
            fullWidth
            displayEmpty
            required
            sx={{ color: colors.text }}
          >
            <MenuItem value="">
              <em>Select a child</em>
            </MenuItem>
            {Array.isArray(childProfiles) && childProfiles.length > 0 ? (
              childProfiles.map((child) => (
                <MenuItem key={child.childID} value={child.childID}>
                  {child.firstName} {child.lastName}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No children available</MenuItem>
            )}
          </Select>

          <Button
            variant="contained"
            onClick={handleViewChildRelation}
            sx={{
              backgroundColor: colors.buttonSecondary,
              '&:hover': { backgroundColor: colors.buttonSecondaryHover },
              color: '#fff',
              textTransform: 'none',
            }}
          >
            View Child&apos;s Relationships
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: {
              xs: handMode === 'right' ? 'flex-end' : 'flex-start',
              sm: 'flex-end',
            }, // Adjust position in mobile
            gap: 2,
            width: '100%',
            mt: 4,
          }}
        >
          {user.accountType === 'Admin' && (
            <Button
              variant="outlined"
              onClick={() => router.push('/admin')}
              sx={{
                borderColor: colors.buttonPrimary,
                color: colors.buttonPrimary,
                '&:hover': {
                  backgroundColor: colors.buttonPrimaryHover,
                  color: '#fff',
                },
                textTransform: 'none',
              }}
            >
              Back to Admin
            </Button>
          )}

          <Button
            variant="contained"
            color="success"
            onClick={() => router.push('/admin/relationship/create')} // Redirect to create relationship page
            sx={{
              textTransform: 'none',
              backgroundColor: colors.buttonPrimary,
              '&:hover': { backgroundColor: colors.buttonSecondaryHover },
            }}
          >
            Create Relationship
          </Button>
        </Box>

        {/* Modal for error message */}
        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <Alert severity="error">{errorMessage}</Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
