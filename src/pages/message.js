import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  retrieveMessageByReceiverID,
  retrieveMessageBySenderID,
  markMessageAsDeletedByReceiver,
  markMessageAsDeletedBySender,
  createMessageInDynamoDB
} from "../utils/messageAPI";
import { getCurrentUser } from "../utils/api";
import { 
  retrieveUserByIDInDynamoDB,
  getUsersByAccountTypeAndLocation
} from "../utils/userAPI";

export default function Messages() {
  const [userDetails, setUserDetails] = useState(null);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [outgoingMessages, setOutgoingMessages] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: "",
    content: "",
    receiver: "",
    sender: "",
  });

  const [usersList, setUsersList] = useState([]);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);


  useEffect(() => {
    fetchUsers();
    fetchMessages();
  }, []);

  const fetchUsers = async () => {
    try {
      const userData = await getCurrentUser();
      const users = [];
      const results = await Promise.allSettled([
        fetchAdminUsers(userData.locationID),
        fetchStaffUsers(userData.locationID),
        fetchParentUsers(userData.locationID),
      ]);

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && Array.isArray(result.value) && result.value.length > 0) {
          users.push(...result.value); // Only add users if the result is a non-empty array
        } else {
          console.error(`No users found for account type ${["Admin", "Staff", "Parent"][index]}`);
        }
      });

      const filteredUsers = users.filter((user) => user.userID !== userData.userID);
      setUsersList(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Failed to load users. Please try again.");
    }
  };
  const fetchMessages = async () => {
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
          console.error(`Failed to fetch user for userID: ${userID}`, error);
          userDetailsMap.set(userID, "Unknown User");
        }
      });

      await Promise.all(userPromises);

    const receivedMessagesWithNames = receivedMessages.map((msg) => ({
      ...msg,
      senderName: userDetailsMap.get(msg.sender) || "Unknown User",
    }));

    const sentMessagesWithNames = sentMessages.map((msg) => ({
      ...msg,
      receiverName: userDetailsMap.get(msg.receiver) || "Unknown User",
    }));

      setIncomingMessages(receivedMessagesWithNames || []);
      setOutgoingMessages(sentMessagesWithNames || []);

      
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIncomingMessages([]); 
      setOutgoingMessages([]); 
      setErrorMessage("Failed to load messages. Please try again later.");
    }
  };

const fetchAdminUsers = async (locationID) => {
  try {
    const response = await getUsersByAccountTypeAndLocation("Admin", locationID);
    if (response.status === "ok" && Array.isArray(response.users) && response.users.length > 0) {
      return response.users;
    } else {
      return []; 
    }
  } catch (error) {
    console.error("Error fetching Admin users:", error);
    return [];
  }
};

const fetchStaffUsers = async (locationID) => {
  try {
    const response = await getUsersByAccountTypeAndLocation("Staff", locationID);
    if (response.status === "ok" && Array.isArray(response.users) && response.users.length > 0) {
      return response.users;
    } else {
      return []; 
    }
  } catch (error) {
    console.error("Error fetching Staff users:", error);
    return []; 
  }
};

const fetchParentUsers = async (locationID) => {
  try {
    const response = await getUsersByAccountTypeAndLocation("Parent", locationID);
    if (response.status === "ok" && Array.isArray(response.users) && response.users.length > 0) {
      return response.users;
    } else {
      return []; 
    }
  } catch (error) {
    console.error("Error fetching Parent users:", error);
    return []; 
  }
};

const fetchReceivedMessages = async (userID) => {
  try {
    const receivedMessages = await retrieveMessageByReceiverID(userID || []);
    return receivedMessages; 
  } catch (error) {
    console.error("Error fetching received messages:", error);
    return []; 
  }
};

const fetchSentMessages = async (userID) => {
  try {
    const sentMessages = await retrieveMessageBySenderID(userID || []);
    return sentMessages; 
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    return []; 
  }
};

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
    if (selectedMessage && deleteType) {
      try {
        if (deleteType === "incoming") {
          await markMessageAsDeletedByReceiver(selectedMessage.messageID);
        } else if (deleteType === "outgoing") {
          await markMessageAsDeletedBySender(selectedMessage.messageID);
        }
        setSuccessMessage("Message deleted successfully.");
        fetchMessages();
      } catch (error) {
        console.error("Error deleting message:", error);
        setErrorMessage("Failed to delete the message. Please try again.");
      } finally {
        handleCloseModal();
      }
    }
  };
  
  const handleCreateMessage = async () => {
    try {
      if (!newMessage.title || !newMessage.content || !newMessage.receiver) {
        setErrorMessage("All fields are required.");
        return;
      }
      
      newMessage.sender = userDetails.userID;

      await createMessageInDynamoDB(newMessage);
      setSuccessMessage("Message sent successfully.");
      setNewMessage({ title: "", content: "", receiver: "", sender: "" });
      setIsCreateFormVisible(false);
      fetchMessages();

    } catch (error) {
      console.error("Error creating message:", error);
      setErrorMessage("Failed to send the message. Please try again.");
    }
  };

  const toggleCreateForm = () => {
    setIsCreateFormVisible((prev) => !prev); // Toggle form visibility
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Messages
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", marginBottom: 2 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Incoming Messages" />
          <Tab label="Outgoing Messages" />
        </Tabs>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
      {selectedTab === 0 && (
        <MessageTable
          messages={incomingMessages}
          type="incoming"
          handleOpenModal={handleOpenModal}
        />
      )}
      {selectedTab === 1 && (
        <MessageTable
          messages={outgoingMessages}
          type="outgoing"
          handleOpenModal={handleOpenModal}
        />
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
        {isCreateFormVisible ? "Cancel Message Creation" : "Create Message"}
      </Button>
      {/* Error and Success Snackbar */}
      {errorMessage && (
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={6000}
          onClose={() => setErrorMessage(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
          <Typography variant="body1">
            Are you sure you want to delete this message?
          </Typography>
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
  );
}

function MessageTable({ messages, type, handleOpenModal }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Subject</strong></TableCell>
            {type === "incoming" && <TableCell><strong>From</strong></TableCell>}
            {type === "outgoing" && <TableCell><strong>To</strong></TableCell>}
            <TableCell><strong>Content</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.messageID}>
              <TableCell>{message.title}</TableCell>
              {type === "incoming" ? (
                <TableCell>{message.senderName}</TableCell>
              ) : (
                <TableCell>{message.receiverName}</TableCell>
              )}
              <TableCell>{message.content}</TableCell>
              <TableCell>{message.datePosted}</TableCell>
              <TableCell>
                <button
                  onClick={() => handleOpenModal(message, type)}
                  style={{
                    color: "white",
                    backgroundColor: "red",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


