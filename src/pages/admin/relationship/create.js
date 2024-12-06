import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  createRelationshipInDynamoDB,
  getRelationshipByParentID,
} from '../../../utils/relationshipAPI';
import { getUsersByAccountTypeAndLocation } from '../../../utils/userAPI';
import { retrieveChildrenByLocationID } from '../../../utils/childAPI';
import { useUser } from '@/components/authenticate';
import { useTheme } from '@/components/ThemeContext'; // Access theme modes
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';

export default function CreateRelationshipPage() {
  const router = useRouter();
  const user = useUser();
  const { darkMode, colorblindMode, handMode } = useTheme(); // Theme settings
  const [childID, setChildID] = useState('');
  const [parentID, setParentID] = useState('');
  const [parentRelation, setParentRelation] = useState('');
  const [childRelation, setChildRelation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [parentsList, setParentsList] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

  // Define dynamic colors
  const colors = {
    background: darkMode ? '#121212' : '#FFEBEE',
    text: darkMode ? '#f1f1f1' : '#2c3e50',
    buttonPrimary: colorblindMode === 'blue-yellow' ? '#e77f24' : darkMode ? '#64b5f6' : '#3498db',
    buttonPrimaryHover:
      colorblindMode === 'blue-yellow' ? '#3db48c' : darkMode ? '#1976d2' : '#2980b9',
    buttonSecondary: colorblindMode === 'red-green' ? '#8c8c8c' : darkMode ? '#81c784' : '#4caf50',
    buttonSecondaryHover:
      colorblindMode === 'red-green' ? '#6d6d6d' : darkMode ? '#388e3c' : '#388e3c',
    alertText: darkMode ? '#ffab91' : '#000',
    alertBackground: darkMode ? '#d32f2f' : '#ff5252',
  };

  useEffect(() => {
    if (user && !(user.accountType === 'Admin' || user.accountType === 'Staff')) {
      setOpenErrorDialog(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [user, router]);

  useEffect(() => {
    if (user.locationID) {
      const fetchLocationData = async () => {
        try {
          const parents = await getUsersByAccountTypeAndLocation('Parent', user.locationID);
          setParentsList(parents.users || []);
          const children = await retrieveChildrenByLocationID(user.locationID);
          setChildrenList(children || []);
        } catch (error) {
          setMessage(`Error fetching location data: ${error.message}`);
        }
      };

      fetchLocationData();
    }
  }, [user.locationID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const createdBy = user.userID;

    if (!createdBy) {
      setMessage('User is not authenticated.');
      return router.push('/login');
    }

    try {
      const existingRelationships = await getRelationshipByParentID(parentID);

      if (existingRelationships.some((relationship) => relationship.childID === childID)) {
        setMessage('A Relationship between this Parent and Child already exists.');
        return;
      }

      const parentEmail = parentsList.find((parent) => parent.userID === parentID)?.email;

      const newRelationship = {
        childID,
        parentID,
        parentRelation,
        childRelation,
        phoneNumber,
        email: parentEmail,
        locationID: user.locationID,
      };

      await createRelationshipInDynamoDB(newRelationship);
      setMessage('Relationship created successfully');
      router.push(`/admin/relationship/${childID}?type=child`);
    } catch (error) {
      setMessage(`Error creating relationship: ${error.message}`);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.background,
        minHeight: '100vh',
        py: { xs: 'none', sm: 4 },
        px: { xs: 'none', sm: 2 },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          mt: { xs: 'none', sm: 4 },
          p: 3,
          backgroundColor: colors.background,
          borderRadius: 2,
          boxShadow: { xs: 'none', sm: 3 },
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: colors.text, fontWeight: 'bold' }}
        >
          Create Relationship
        </Typography>

        <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage('')}>
          <Alert
            onClose={() => setMessage('')}
            severity={message.includes('successfully') ? 'success' : 'error'}
            sx={{
              width: '100%',
              backgroundColor: colors.alertBackground,
              color: colors.alertText,
            }}
          >
            {message}
          </Alert>
        </Snackbar>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Parent Selection */}
          <FormControl fullWidth required>
            <InputLabel
              sx={{
                color: colors.text, // Adapts label color to dark mode and colorblind settings
                '&.Mui-focused': {
                  color: colors.buttonPrimary, // Change color when focused
                },
              }}
            >
              Adult
            </InputLabel>
            <Select
              label="Select Parent"
              value={parentID}
              onChange={(e) => setParentID(e.target.value)}
              fullWidth
              required
              sx={{
                color: colors.text, // Adapts input text color
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.text, // Adapts border color
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.buttonPrimary, // Hover border color
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.buttonPrimaryHover, // Focused border color
                },
              }}
            >
              {Array.isArray(parentsList) && parentsList.length > 0 ? (
                parentsList.map((parent) => (
                  <MenuItem key={parent.userID} value={parent.userID}>
                    {parent.firstName} {parent.lastName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Adults available</MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Child Selection */}
          <FormControl fullWidth required>
            <InputLabel
              sx={{
                color: colors.text, // Adapts label color to dark mode and colorblind settings
                '&.Mui-focused': {
                  color: colors.buttonPrimary, // Change color when focused
                },
              }}
            >
              Child
            </InputLabel>
            <Select
              label="Select Child"
              value={childID}
              onChange={(e) => setChildID(e.target.value)}
              fullWidth
              
              required
              sx={{
                color: colors.text, // Adapts input text color
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.text, // Adapts border color
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.buttonPrimary, // Hover border color
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.buttonPrimaryHover, // Focused border color
                },
              }}
            >
              {Array.isArray(childrenList) && childrenList.length > 0 ? (
                childrenList.map((child) => (
                  <MenuItem key={child.childID} value={child.childID}>
                    {child.firstName} {child.lastName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No children available</MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField
            label="Adult Relation"
            value={parentRelation}
            onChange={(e) => setParentRelation(e.target.value)}
            required
            InputLabelProps={{
              style: {
                color: colors.text, // Adapts to dark mode and colorblind settings
              },
            }}
            InputProps={{
              style: {
                color: colors.text, // Adapts input text color
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.text, // Adapts border color
                },
                '&:hover fieldset': {
                  borderColor: colors.buttonPrimary, // Hover border color
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.buttonPrimaryHover, // Focused border color
                },
              },
            }}
          />

          <TextField
            label="Child Relation"
            value={childRelation}
            onChange={(e) => setChildRelation(e.target.value)}
            required
            InputLabelProps={{
              style: {
                color: colors.text, // Adapts to dark mode and colorblind settings
              },
            }}
            InputProps={{
              style: {
                color: colors.text, // Adapts input text color
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.text, // Adapts border color
                },
                '&:hover fieldset': {
                  borderColor: colors.buttonPrimary, // Hover border color
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.buttonPrimaryHover, // Focused border color
                },
              },
            }}
          />

          <TextField
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            InputLabelProps={{
              style: {
                color: colors.text, // Adapts to dark mode and colorblind settings
              },
            }}
            InputProps={{
              style: {
                color: colors.text, // Adapts input text color
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.text, // Adapts border color
                },
                '&:hover fieldset': {
                  borderColor: colors.buttonPrimary, // Hover border color
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.buttonPrimaryHover, // Focused border color
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: colors.buttonPrimary, // Colorblind-friendly primary color
              color: '#fff',
              '&:hover': { backgroundColor: colors.buttonPrimaryHover },
            }}
          >
            Create Relationship
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{
              color: colors.buttonPrimary,
              borderColor: colors.buttonPrimary,
              '&:hover': { borderColor: colors.buttonPrimaryHover, color: '#fff' },
            }}
            onClick={() => router.back()}
          >
            Previous Page
          </Button>
        </Box>

        {/* Unauthorized Access Dialog */}
        <Dialog
          open={openErrorDialog}
          onClose={() => setOpenErrorDialog(false)}
          aria-labelledby="error-dialog-title"
          aria-describedby="error-dialog-description"
        >
          <DialogTitle id="error-dialog-title">Unauthorized Access</DialogTitle>
          <DialogContent>
            <Typography variant="body1" id="error-dialog-description">
              You are not authorized to create relationships. Redirecting to the homepage...
            </Typography>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
