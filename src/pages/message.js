import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  retrieveMessageByReceiverID,
  retrieveMessageBySenderID,
  markMessageAsDeletedByReceiver,
  markMessageAsDeletedBySender,
  createMessageInDynamoDB,
} from '../utils/messageAPI';
import { getCurrentUser } from '../utils/api';
import { retrieveUserByIDInDynamoDB, getUsersByAccountTypeAndLocation } from '../utils/userAPI';
import { useCallback } from 'react';
import { useTheme } from '@/components/ThemeContext'; // Import ThemeContext

export default function Messages() {
  const [userDetails, setUserDetails] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    receiver: '',
    sender: '',
  });

  const [usersList, setUsersList] = useState([]);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [filterUserID, setFilterUserID] = useState(null);
  const [filterFirstName, setFilterFirstName] = useState(null);
  const [filterLastName, setFilterLastName] = useState(null);

  const { darkMode, colorblindMode, handMode } = useTheme();

  const { showDelete, setShowDelete } = useState(false);

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
      danger: '#d32f2f',
    },
    'blue-yellow': {
      primary: '#e77f24',
      secondary: '#3db48c',
      danger: '#c62828',
    },
  };

  const colors = buttonColors[colorblindMode] || buttonColors['original'];
  const alignment =
    handMode === 'left' ? 'flex-start' : handMode === 'right' ? 'flex-end' : 'center';

  const fetchUsers = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      const users = [];
      const results = await Promise.allSettled([
        fetchAdminUsers(userData.locationID),
        fetchStaffUsers(userData.locationID),
        fetchParentUsers(userData.locationID),
      ]);

      results.forEach((result, index) => {
        if (
          result.status === 'fulfilled' &&
          Array.isArray(result.value) &&
          result.value.length > 0
        ) {
          users.push(...result.value);
        } else {
        }
      });

      const filteredUsers = users.filter((user) => user.userID !== userData.userID);
      setUsersList(filteredUsers);
    } catch (error) {
      setErrorMessage('Failed to load users. Please try again.');
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUserDetails(userData);

      const [receivedMessages, sentMessages] = await Promise.all([
        fetchReceivedMessages(userData.userID),
        fetchSentMessages(userData.userID),
      ]);

      const uniqueUserIDs = [
        ...new Set([
          ...receivedMessages.map((msg) => msg.sender),
          ...sentMessages.map((msg) => msg.receiver),
        ]),
      ];

      const userDetailsMap = new Map();
      const userPromises = uniqueUserIDs.map(async (userID) => {
        try {
          const user = await retrieveUserByIDInDynamoDB(userID);
          userDetailsMap.set(userID, `${user.user.user.firstName} ${user.user.user.lastName}`);
        } catch (error) {
          userDetailsMap.set(userID, 'Unknown User');
        }
      });

      await Promise.all(userPromises);

      const receivedMessagesWithNames = receivedMessages.map((msg) => ({
        ...msg,
        senderName: userDetailsMap.get(msg.sender) || 'Unknown User',
        messageType: 'Incoming',
      }));

      const sentMessagesWithNames = sentMessages.map((msg) => ({
        ...msg,
        receiverName: userDetailsMap.get(msg.receiver) || 'Unknown User',
        messageType: 'Outgoing',
      }));
      const allMessagesList = [...receivedMessagesWithNames, ...sentMessagesWithNames];
      allMessagesList.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
      setAllMessages(allMessagesList);
      setFilteredMessages(allMessagesList);
    } catch (error) {
      setAllMessages([]);
      setErrorMessage('Failed to load messages. Please try again later.');
    }
  }, []);

  const fetchAdminUsers = async (locationID) => {
    try {
      const response = await getUsersByAccountTypeAndLocation('Admin', locationID);
      if (response.status === 'ok' && Array.isArray(response.users) && response.users.length > 0) {
        return response.users;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  const fetchStaffUsers = async (locationID) => {
    try {
      const response = await getUsersByAccountTypeAndLocation('Staff', locationID);
      if (response.status === 'ok' && Array.isArray(response.users) && response.users.length > 0) {
        return response.users;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  const fetchParentUsers = async (locationID) => {
    try {
      const response = await getUsersByAccountTypeAndLocation('Parent', locationID);
      if (response.status === 'ok' && Array.isArray(response.users) && response.users.length > 0) {
        return response.users;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  const fetchReceivedMessages = async (userID) => {
    try {
      const receivedMessages = await retrieveMessageByReceiverID(userID || []);
      return receivedMessages;
    } catch (error) {
      return [];
    }
  };

  const fetchSentMessages = async (userID) => {
    try {
      const sentMessages = await retrieveMessageBySenderID(userID || []);
      return sentMessages;
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMessages();
  }, [fetchUsers, fetchMessages]);

  useEffect(() => {
    if (filterUserID) {
      const filtered = allMessages.filter(
        (msg) => msg.sender === filterUserID || msg.receiver === filterUserID
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(allMessages);
    }
  }, [filterUserID, allMessages]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenModal = (message, type) => {
    setSelectedMessage(message);
    setDeleteType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMessage(null);
    setDeleteType(null);
  };

  const handleDelete = async () => {
    if (selectedMessage) {
      try {
        if (selectedMessage.messageType === 'Incoming') {
          await markMessageAsDeletedByReceiver(selectedMessage.messageID);
        } else if (selectedMessage.messageType === 'Outgoing') {
          await markMessageAsDeletedBySender(selectedMessage.messageID);
        }
        setSuccessMessage('Message deleted successfully.');
        fetchMessages();
      } catch (error) {
        setErrorMessage('Failed to delete the message. Please try again.');
      } finally {
        handleCloseModal();
      }
    }
  };

  const handleShowDelete = () => {
    setShowDelete(!showDelete);
  };

  const handleCreateMessage = async () => {
    try {
      if (!newMessage.title || !newMessage.content || !newMessage.receiver) {
        setErrorMessage('All fields are required.');
        return;
      }

      newMessage.sender = userDetails.userID;

      await createMessageInDynamoDB(newMessage);
      setSuccessMessage('Message sent successfully.');
      setNewMessage({ title: '', content: '', receiver: '', sender: '' });
      setIsCreateFormVisible(false);
      fetchMessages();
    } catch (error) {
      setErrorMessage('Failed to send the message. Please try again.');
    }
  };

  const toggleCreateForm = () => {
    setIsCreateFormVisible((prev) => !prev); // Toggle form visibility
  };

  const handleNameClick = async (userID) => {
    const user = await retrieveUserByIDInDynamoDB(userID);
    setFilterUserID(userID); // Filter messages based on clicked user ID
    setFilterFirstName(user.user.user.firstName);
    setFilterLastName(user.user.user.lastName);
  };

  return (
    <Box
      sx={{
        backgroundColor: darkMode ? '#121212' : '#f7f9fc',
        minHeight: '100vh',
        py: 4,
        px: { xs: 1, md: 3 },
      }}
    >
      <Container>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ color: darkMode ? '#fff' : '#2c3e50', fontWeight: 'bold' }}
        >
          Messages
        </Typography>

        <Box
          sx={{
            borderBottom: 1,
            borderColor: darkMode ? '#555' : 'divider', // Adjust border color
            marginBottom: 2,
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            textColor={darkMode ? 'inherit' : 'primary'} // Use 'inherit' for dark mode
            TabIndicatorProps={{
              style: {
                backgroundColor: colors.primary, // Use dynamic color based on colorblind mode
              },
            }}
            centered={handMode === 'none'} // Center if hand mode is 'none'
            sx={{
              justifyContent:
                handMode === 'left' ? 'flex-start' : handMode === 'right' ? 'flex-end' : 'center',
              '& .MuiTab-root': {
                color: darkMode ? '#fff' : '#333', // Adjust tab text color
                '&.Mui-selected': {
                  color: colors.primary, // Highlight selected tab dynamically
                },
              },
            }}
          >
            <Tab label="Incoming" />
            <Tab label="Outgoing" />
            <Tab label="All" />
          </Tabs>
        </Box>
        <Box sx={{ marginBottom: 2 }}>
          {selectedTab === 0 && (
            <MessageTable
              messages={filteredMessages.filter((msg) => msg.messageType === 'Incoming')}
              type="incoming"
              handleOpenModal={handleOpenModal}
              handleNameClick={handleNameClick}
              userDetails={userDetails}
            />
          )}
          {selectedTab === 1 && (
            <MessageTable
              messages={filteredMessages.filter((msg) => msg.messageType === 'Outgoing')}
              type="outgoing"
              handleOpenModal={handleOpenModal}
              handleNameClick={handleNameClick}
              userDetails={userDetails}
            />
          )}
          {selectedTab === 2 && ( // Render the All Messages tab
            <MessageTable
              messages={filteredMessages}
              type="all"
              handleOpenModal={handleOpenModal}
              handleNameClick={handleNameClick}
              userDetails={userDetails}
            />
          )}
          {!filterUserID && (
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : '#333' }} // Adjust text color for dark mode
            >
              *Select a name to filter messages
            </Typography>
          )}
          <Box sx={{ marginTop: 2 }}>
            {filterFirstName && filterLastName ? (
              <Typography
                variant="body1"
                sx={{ color: darkMode ? '#ccc' : '#333' }} // Adjust text color
              >
                Sort By User: {filterFirstName} {filterLastName}
              </Typography>
            ) : (
              <Typography variant="body1"></Typography>
            )}
          </Box>

          {filterUserID && (
            <Button
              variant="outlined"
              sx={{
                marginTop: 2,
                color: colors.danger, // Use colorblind mode color
                borderColor: colors.danger,
                '&:hover': {
                  backgroundColor: colors.danger,
                  color: '#fff',
                },
              }}
              onClick={() => {
                setFilterUserID(null);
                setFilterFirstName(null);
                setFilterLastName(null);
              }}
            >
              Clear Filter
            </Button>
          )}
        </Box>

        {isCreateFormVisible && (
          <Box sx={{ marginBottom: 4 }}>
            <Typography variant="h6">Create New Message</Typography>

            <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
              <InputLabel>Receiver</InputLabel>
              <Select
                value={newMessage.receiver}
                onChange={(e) => setNewMessage({ ...newMessage, receiver: e.target.value })}
              >
                {usersList.map((user) => (
                  <MenuItem key={user.userID} value={user.userID}>
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
              <TextField
                label="Title"
                value={newMessage.title}
                onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
              />
            </FormControl>
            <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
              <TextField
                label="Content"
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                multiline
                rows={4}
              />
            </FormControl>

            <Button variant="contained" color="primary" onClick={handleCreateMessage}>
              Send Message
            </Button>

            <Typography variant="body2" color="textSecondary" sx={{ marginTop: 2 }}>
              * Once sent, messages cannot be unsent or edited.
            </Typography>
          </Box>
        )}
        <Button variant="contained" color="primary" onClick={toggleCreateForm}>
          {isCreateFormVisible ? 'Cancel Message Creation' : 'Create Message'}
        </Button>
        {/* Error and Success Snackbar */}
        {errorMessage && (
          <Snackbar
            open={Boolean(errorMessage)}
            autoHideDuration={6000}
            onClose={() => setErrorMessage(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Paper>
              <Typography variant="body1" sx={{ padding: 2 }}>
                {errorMessage}
              </Typography>
            </Paper>
          </Snackbar>
        )}

        {successMessage && (
          <Snackbar
            open={Boolean(successMessage)}
            autoHideDuration={6000}
            onClose={() => setSuccessMessage(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Paper>
              <Typography variant="body1" sx={{ padding: 2 }}>
                {successMessage}
              </Typography>
            </Paper>
          </Snackbar>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body1">Are you sure you want to delete this message?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
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
}

function MessageTable({ messages, type, handleOpenModal, handleNameClick, userDetails }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {type === 'incoming' && (
              <TableCell>
                <strong>From</strong>
              </TableCell>
            )}
            {type === 'outgoing' && (
              <TableCell>
                <strong>To</strong>
              </TableCell>
            )}
            {type === 'all' && (
              <>
                <TableCell>
                  <strong>From</strong>
                </TableCell>
                <TableCell>
                  <strong>To</strong>
                </TableCell>
              </>
            )}
            <TableCell>
              <strong>Content</strong>
            </TableCell>
            <TableCell>
              <strong> ... </strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.messageID}>
              {type !== 'outgoing' && (
                <TableCell>
                  {message.sender !== userDetails.userID ? (
                    <span
                      onClick={() => handleNameClick(message.sender)}
                      style={{ cursor: 'pointer', color: 'blue' }}
                    >
                      {message.senderName}
                    </span>
                  ) : (
                    `${userDetails.firstName} ${userDetails.lastName}`
                  )}
                </TableCell>
              )}
              {type !== 'incoming' && (
                <TableCell>
                  {message.receiver !== userDetails.userID ? (
                    <span
                      onClick={() => handleNameClick(message.receiver)}
                      style={{ cursor: 'pointer', color: 'blue' }}
                    >
                      {message.receiverName}
                    </span>
                  ) : (
                    `${userDetails.firstName} ${userDetails.lastName}`
                  )}
                </TableCell>
              )}
              <TableCell>
                <strong>{message.title}</strong>
                <Divider />
                {message.content}
                <br />
                <Divider />
                <strong>{new Date(message.datePosted).toLocaleDateString('en-CA')}</strong>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleOpenModal(message, type)}
                  style={{
                    color: 'white',
                    backgroundColor: '#f28c7a',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                >
                  X
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
