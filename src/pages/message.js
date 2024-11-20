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
} from "@mui/material";
import {
  retrieveMessageByReceiverID,
  retrieveMessageBySenderID,
  markMessageAsDeletedByReceiver,
  markMessageAsDeletedBySender,
} from "../utils/messageAPI";
import { getCurrentUser } from "../utils/api";
import { retrieveUserByIDInDynamoDB } from "../utils/userAPI";

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

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const userData = await getCurrentUser();
        setUserDetails(userData);

        const receivedMessages = await retrieveMessageByReceiverID(userData.userID);
        const sentMessages = await retrieveMessageBySenderID(userData.userID);

        const uniqueUserIDs = [
          ...new Set([ ...receivedMessages.map((msg) => msg.sender), ...sentMessages.map((msg) => msg.receiver), ])
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

        setIncomingMessages(receivedMessagesWithNames);
        setOutgoingMessages(sentMessagesWithNames);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setErrorMessage("Failed to load messages. Please try again later.");
      }
    };

    fetchMessages();
  }, []);

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
        window.location.reload(); // You might want to optimize this and only reload the message list instead of the whole page
      } catch (error) {
        console.error("Error deleting message:", error);
        setErrorMessage("Failed to delete the message. Please try again.");
      } finally {
        handleCloseModal();
      }
    }
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
