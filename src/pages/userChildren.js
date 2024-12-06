import { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Collapse,
  IconButton,
  Pagination,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { retrieveChildProfileByID } from '../utils/childAPI';
import { getRelationshipByParentID } from '../utils/relationshipAPI';
import { useRouter } from 'next/router';
import { useUser } from '@/components/authenticate';
import { useTheme } from '@/components/ThemeContext'; // Import ThemeContext for modes
import SnackbarNotification from '../components/Modal/SnackBar'; // Import the Snackbar component

const UserChildren = () => {
  const { darkMode, colorblindMode, handMode } = useTheme(); // Access theme modes
  const user = useUser();
  const [children, setChildren] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCard, setExpandedCard] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const resultsPerPage = 3;
  const router = useRouter();
  const isInitialMount = useRef(true);

  // Define colors dynamically based on modes
  const colors = {
    background: darkMode ? '#121212' : '#f7f9fc',
    cardBackground: darkMode ? '#1e1e1e' : '#ffffff',
    text: darkMode ? '#f1f1f1' : '#000000',
    buttonPrimary: colorblindMode === 'blue-yellow' ? '#e77f24' : '#1976d2',
    buttonSecondary: colorblindMode === 'red-green' ? '#3db48c' : '#4caf50',
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isInitialMount.current) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the token
        const userID = decodedToken.userID; // Extract the userID
        if (userID) {
          fetchChildrenProfiles(userID); // Fetch child profiles
        }
        isInitialMount.current = false; // Mark as not the initial mount
      } catch (error) {
        //console.error("Error decoding token:", error);
        setSnackbar({
          open: true,
          message: 'Invalid token. Please log in again.',
          severity: 'error',
        });
        router.push('/login'); // Redirect to login page if token is invalid
      }
    } else if (!token) {
      router.push('/login'); // Redirect to login page if no token is found
    }
  }, [router]);

  const fetchChildrenProfiles = async (parentID) => {
    try {
      const relationships = await getRelationshipByParentID(parentID); // Fetch relationships
      const childProfiles = await Promise.all(
        relationships.map(async (rel) => {
          const response = await retrieveChildProfileByID(rel.childID); // Fetch child profile
          if (response.child?.success) {
            return response.child.child; // Extract the child object
          }
          return null; // Skip if no child data is returned
        })
      );
      setChildren(childProfiles.filter((profile) => profile !== null)); // Filter out null responses
    } catch (error) {
      //console.error("Error fetching child profiles:", error);
      //setSnackbar({ open: true, message: "Error fetching child profiles.", severity: "error" });
    }
  };

  const handleExpandClick = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const paginatedResults = children.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <Box
      sx={{
        backgroundColor: colors.background,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        py: 4,
        px: 2,
      }}
    >
      <Typography
        variant="h3"
        mt={3}
        sx={{ color: colors.text, textAlign: 'center', fontWeight: 'bold' }}
      >
        {user.firstName} {user.lastName}&apos;s Children
      </Typography>

      {children.length === 0 ? (
        <Typography variant="h6" sx={{ color: colors.text, textAlign: 'center' }}>
          No child profiles found for the user.
        </Typography>
      ) : (
        <Box sx={{ width: '50%', mt: 4 }}>
          {paginatedResults.map((child, index) => (
            <Card
              key={index}
              sx={{
                mb: 2,
                backgroundColor: colors.cardBackground,
                boxShadow: 3,
              }}
            >
              <CardActionArea onClick={() => handleExpandClick(index)}>
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: colors.text,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {child.lastName}, {child.firstName}
                  </Typography>
                  <IconButton
                    sx={{
                      transform: expandedCard === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                      color: colors.text,
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </CardContent>
              </CardActionArea>
              <Collapse in={expandedCard === index} timeout="auto" unmountOnExit>
                <CardContent sx={{ color: colors.text }}>
                  <Typography variant="body2">
                    <strong>Child ID:</strong> {child.childID}
                  </Typography>
                  <Typography variant="body2">
                    <strong>First Name:</strong> {child.firstName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Last Name:</strong> {child.lastName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Birth Date:</strong> {child.birthDate}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Age:</strong> {child.age}
                  </Typography>
                </CardContent>
              </Collapse>
            </Card>
          ))}

          {/* Conditionally render Pagination */}
          {children.length > resultsPerPage && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: handMode === 'right' ? 'flex-end' : 'flex-start',
                mt: 2,
              }}
            >
              <Pagination
                count={Math.ceil(children.length / resultsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                sx={{
                  color: colors.buttonPrimary,
                  '& .Mui-selected': {
                    backgroundColor: colors.buttonPrimary,
                    color: '#fff',
                  },
                }}
              />
            </Box>
          )}
        </Box>
      )}

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default UserChildren;
