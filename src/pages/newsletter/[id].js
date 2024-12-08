import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getNewsletter, updateNewsletter, deleteNewsletter } from '@/utils/newsletterAPI';
import { sendEmailsToUsers } from '@/utils/emailAPI';
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useUser } from '@/components/authenticate';
import { useTheme } from '@/components/ThemeContext'; // Import ThemeContext

export default function NewsletterDetailPage() {
  const user = useUser();
  const { darkMode, colorblindMode } = useTheme(); // Access dark mode and colorblind mode
  const router = useRouter();
  const { id } = router.query;
  const [newsletter, setNewsletter] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State for delete confirmation dialog
  const [handMode, setHandMode] = useState('none'); // Default to none

  const accountTypeOptions = ['Admin', 'Staff', 'Parent'];

  // Load hand mode from localStorage
  useEffect(() => {
    const storedHandMode = localStorage.getItem('handMode') || 'none';
    setHandMode(storedHandMode);
  }, []);

  // Define original and colorblind-friendly button colors
  const buttonColors = {
    original: {
      primary: '#3498db',
      secondary: '#2ecc71',
      danger: '#e74c3c',
    },
    'red-green': {
      primary: '#1976d2',
      secondary: '#ff9800',
      danger: '#e77f24',
    },
    'blue-yellow': {
      primary: '#e77f24',
      secondary: '#3db48c',
      danger: '#c62828',
    },
  };

  const colors = buttonColors[colorblindMode] || buttonColors['original'];

  // Utility function for hand mode alignment
  const getAlignment = () => {
    return handMode === 'left' ? 'flex-start' : handMode === 'right' ? 'flex-end' : 'left';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-CA');  // 'en-CA' format gives 'yyyy-mm-dd'
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user) {
      setMessage('User is not authenticated');
      router.push('/login');
      return;
    }

    async function fetchData() {
      try {
        if (id) {
          const data = await getNewsletter(token, id);
          setNewsletter(data.newsletter.newsletter);
          setLoading(false);
        }
      } catch (error) {
        setMessage('Error fetching newsletter details');
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsletter((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountTypeChange = (e) => {
    const { value, checked } = e.target;
    setSelectedAccountTypes((prevSelected) =>
      checked
        ? [...prevSelected, value]
        : prevSelected.filter((accountType) => accountType !== value)
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('User is not authenticated');
      return;
    }

    try {
      await updateNewsletter(token, id, {
        title: newsletter.title,
        content: newsletter.content,
      });
      setMessage('Newsletter updated successfully');
      setEditMode(false);
      await fetchData();
    } catch (error) {
      setMessage('Error updating newsletter');
    }
  };

  const sendNewsletterViaEmail = async () => {
    setSendingEmail(true);
    const token = localStorage.getItem('token');
    const subject = newsletter.title;
    const content = newsletter.content;
    try {
      for (const accountType of selectedAccountTypes) {
        await sendEmailsToUsers(token, accountType, user.locationID, subject, content);
      }
      setMessage('Newsletter emailed successfully to selected users.');
    } catch (error) {
      setMessage('Error sending newsletter via email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDelete = async () => {
    setOpenDeleteDialog(false);
    const token = localStorage.getItem('token');
    try {
      await deleteNewsletter(token, id);
      setMessage('Newsletter deleted successfully');
      setTimeout(() => router.push('/newsletter'), 500);
    } catch (error) {
      setMessage('Error deleting newsletter');
    }
  };

  const backToList = () => {
    router.push('/newsletter');
  };

  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: darkMode ? '#121212' : '#f7f9fc',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: darkMode ? '#121212' : '#f7f9fc', // Page-wide dark/light background
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: { xs: 'none', sm: 'center' },
        py: { xs: 'none', sm: 4 },
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          mt: { xs: 'none', sm: 4 },
          p: 3,
          backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', // Container-specific background
          borderRadius: 2,
          boxShadow: { xs: 'none', sm: 3 }, // Hide shadow in mobile view
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: darkMode ? '#ffffff' : '#2c3e50', fontWeight: 'bold' }}
        >
          Newsletter Details
        </Typography>

        {message && (
          <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={() => setMessage('')}>
            <Alert severity="info">{message}</Alert>
          </Snackbar>
        )}

        {newsletter && (
          <Box>
            {/* Form Section */}
            {editMode ? (
              <Box
                component="form"
                onSubmit={handleUpdate}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  label="Title"
                  name="title"
                  value={newsletter.title}
                  onChange={handleInputChange}
                  required
                  fullWidth
                />
                <TextField
                  label="Content"
                  name="content"
                  value={newsletter.content}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  multiline
                  rows={6}
                />
                {/* Action Buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: getAlignment(),
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: colors.primary,
                      color: '#fff',
                      '&:hover': { backgroundColor: colors.secondary },
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button variant="outlined" onClick={() => setEditMode(false)} sx={{ mt: 1 }}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                {/* Details Section */}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'bold', color: darkMode ? '#ffffff' : '#2c3e50' }}
                >
                  Title:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: darkMode ? '#e0e0e0' : '#2c3e50' }}>
                  {newsletter.title}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'bold', color: darkMode ? '#ffffff' : '#2c3e50' }}
                >
                  Content:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: darkMode ? '#e0e0e0' : '#2c3e50' }}>
                  {newsletter.content}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'bold', color: darkMode ? '#ffffff' : '#2c3e50' }}
                >
                  Published By:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: darkMode ? '#e0e0e0' : '#2c3e50' }}>
                  {newsletter.publishedBy}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2, color: darkMode ? '#bdbdbd' : '#7f8c8d' }}>
                  Created At: {newsletter.createdAt}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: darkMode ? '#bdbdbd' : '#7f8c8d' }}>
                  Updated At: {formatDate(newsletter.updatedAt)}
                </Typography>

                {/* Edit Button */}
                {(user.accountType === 'Admin' || user.accountType === 'Staff') && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: getAlignment(),
                      mt: 3,
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => setEditMode(true)}
                      sx={{
                        mt: 2,
                        backgroundColor: colors.primary,
                        color: '#fff',
                        '&:hover': { backgroundColor: colors.secondary },
                      }}
                    >
                      Edit Newsletter
                    </Button>
                  </Box>
                )}
                {user.accountType === 'Admin' && (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: getAlignment(),
                        gap: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => setOpenDeleteDialog(true)}
                        sx={{
                          mt: 2,
                          borderColor: colors.danger,
                          color: colors.danger,
                          '&:hover': {
                            backgroundColor: colors.danger,
                            color: '#fff',
                          },
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                    <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                      <DialogTitle>Confirm Delete</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          Are you sure you want to delete this newsletter? This action cannot be
                          undone.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                          Cancel
                        </Button>
                        <Button onClick={handleDelete} color="error">
                          Delete
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )}

                {(user.accountType === 'Admin' || user.accountType === 'Staff') && (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' }, // Stack vertically on small screens, horizontally on larger screens
                        justifyContent: getAlignment(), // Align based on hand mode
                        alignItems: { xs: 'flex-start', md: 'flex-start' }, // Ensure consistent alignment across devices
                        gap: 2,
                        flexWrap: 'wrap', // Allow wrapping for better alignment
                        mt: 3, // Add margin-top for spacing
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          mt: { xs: 2, md: 0 },
                          minWidth: '200px',
                          flexShrink: 0, // Prevent text from shrinking
                          textAlign: { xs: 'left', md: 'right' }, // Align text based on screen size
                          mr: { md: 2 }, // Add margin-right on larger screens for spacing
                          color: darkMode ? '#e0e0e0' : '#2c3e50',
                        }}
                      >
                        Select Account Types to Email:
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          flexWrap: 'wrap', // Ensure checkboxes wrap neatly
                          gap: 2,
                          justifyContent: 'flex-start', // Align checkboxes to the start
                        }}
                      >
                        {accountTypeOptions.map((accountType) => (
                          <FormControlLabel
                            key={accountType}
                            control={
                              <Checkbox
                                value={accountType}
                                onChange={handleAccountTypeChange}
                                sx={{
                                  color: darkMode ? '#e0e0e0' : '#2c3e50',
                                  '&.Mui-checked': {
                                    color: darkMode ? '#ffffff' : colors.primary,
                                  },
                                }}
                              />
                            }
                            label={accountType}
                            sx={{
                              color: darkMode ? '#e0e0e0' : '#2c3e50',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </>
                )}

                {(user.accountType === 'Admin' || user.accountType === 'Staff') && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: getAlignment(),
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={sendNewsletterViaEmail}
                      disabled={sendingEmail || selectedAccountTypes.length === 0}
                      sx={{
                        mt: 3,
                        backgroundColor: colors.secondary,
                        color: '#fff',
                        '&:hover': { backgroundColor: colors.primary },
                      }}
                      startIcon={sendingEmail && <CircularProgress size={20} />}
                    >
                      {sendingEmail ? 'Sending...' : 'Email Newsletter'}
                    </Button>
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: getAlignment(),
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    variant="text"
                    onClick={backToList}
                    sx={{
                      mt: 3,
                      color: colors.primary,
                      '&:hover': { color: colors.secondary },
                    }}
                  >
                    Back to Newsletter List
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
