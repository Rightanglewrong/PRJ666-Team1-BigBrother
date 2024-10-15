import { useState, useEffect } from 'react';
import {
  createMessageInDynamoDB,
  retrieveMessageFromDynamoDB,
  updateMessageInDynamoDB,
  deleteMessageFromDynamoDB,
  retrieveMessageByReceiverID,
  retrieveMessageBySenderID,
} from '../utils/messageAPI';
import { getCurrentUser } from '../utils/api';
import styles from "./calendar.module.css";

export default function Message() {
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [senderID, setSenderID] = useState('');
  const [receiverID, setReceiverID] = useState('');
  const [retrieveMessageID, setRetrieveMessageID] = useState('');
  const [updateMessageID, setUpdateMessageID] = useState('');
  const [deleteMessageID, setDeleteMessageID] = useState('');

  const [retrievedMessage, setRetrievedMessage] = useState(null);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [userId, setUserId] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Fetch user details and set userId and authorization
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUserId(userData.userID);
          setIsAuthorized(userData.accountType === 'Admin' || userData.accountType === 'Staff');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrorMessage('Failed to load user details. Please log in again.');
        setShowErrorModal(true);
      }
    };

    fetchUserDetails();
  }, []);

  const handleCreateMessage = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMessage('Unauthorized: Only admin or staff can create messages.');
      setShowErrorModal(true);
      return;
    }

    try {
      const newMessage = {
        title: messageTitle,
        content: messageContent,
        sender: userId,
        receiver: receiverID,
      };

      const data = await createMessageInDynamoDB(newMessage);
      setMessage(`Message created successfully: ${JSON.stringify(data.message)}`);
      setMessageTitle('');
      setMessageContent('');
      setReceiverID('');
    } catch (error) {
      setMessage(`Error creating message: ${error.message}`);
    }
  };

  const handleRetrieveMessage = async (e) => {
    e.preventDefault();
    try {
      const data = await retrieveMessageFromDynamoDB(messageID);
      setRetrievedMessage(data);
      setMessage('Message retrieved successfully');
      setMessageID('');
    } catch (error) {
      setMessage(`Error retrieving message: ${error.message}`);
    }
  };

  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMessage('Unauthorized: Only admin or staff can update messages.');
      setShowErrorModal(true);
      return;
    }

    try {
      const updateData = {
        title: messageTitle,
        content: messageContent,
      };

      const data = await updateMessageInDynamoDB(messageID, updateData);
      setMessage(`Message updated successfully: ${JSON.stringify(data.updatedAttributes)}`);
      setMessageID('');
      setMessageTitle('');
      setMessageContent('');
    } catch (error) {
      setMessage(`Error updating message: ${error.message}`);
    }
  };

  const handleDeleteMessage = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMessage('Unauthorized: Only admin or staff can delete messages.');
      setShowErrorModal(true);
      return;
    }

    try {
      const data = await deleteMessageFromDynamoDB(messageID);
      setMessage('Message deleted successfully');
      setMessageID('');
    } catch (error) {
      setMessage(`Error deleting message: ${error.message}`);
    }
  };

  const handleFilterMessagesByReceiver = async (e) => {
    e.preventDefault();
    try {
      const messages = await retrieveMessageByReceiverID(userId);
      setFilteredMessages(messages);
      setMessage(`Found ${messages.length} messages for receiver ID: ${userId}`);
    } catch (error) {
      setMessage(`Error fetching messages: ${error.message}`);
    }
  };

  const handleFilterMessagesBySender = async (e) => {
    e.preventDefault();
    try {
      const messages = await retrieveMessageBySenderID(userId);
      setFilteredMessages(messages);
      setMessage(`Found ${messages.length} messages for sender ID: ${userId}`);
    } catch (error) {
      setMessage(`Error fetching messages: ${error.message}`);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <div>
      <h1>Message CRUD Test Page</h1>
      <p>{message}</p>

      {/* Create Message */}
      <h3>Create Message</h3>
      <form onSubmit={handleCreateMessage}>
        <input
          type="text"
          value={messageTitle}
          placeholder="Message Title"
          onChange={(e) => setMessageTitle(e.target.value)}
        />
        <input
          type="text"
          value={messageContent}
          placeholder="Message Content"
          onChange={(e) => setMessageContent(e.target.value)}
        />
        <input
          type="text"
          value={receiverID}
          placeholder="Receiver ID"
          onChange={(e) => setReceiverID(e.target.value)}
        />
        <button type="submit">Create Message</button>
      </form>

      {/* Retrieve Message */}
      <h3>Retrieve Message</h3>
      <input
        type="text"
        value={retrieveMessageID}
        placeholder="Message ID"
        onChange={(e) => setRetrieveMessageID(e.target.value)}
      />
      <button onClick={handleRetrieveMessage} disabled={!retrieveMessageID}>
        Retrieve Message
      </button>
      {retrievedMessage && <p>Retrieved Message: {JSON.stringify(retrievedMessage)}</p>}

      {/* Update Message */}
      <h3>Update Message</h3>
      <form onSubmit={handleUpdateMessage}>
        <input
          type="text"
          value={updateMessageID}
          placeholder="Message ID"
          onChange={(e) => setUpdateMessageID(e.target.value)}
        />
        <input
          type="text"
          value={updateTitle}
          placeholder="New Message Title"
          onChange={(e) => setUpdateTitle(e.target.value)}
        />
        <input
          type="text"
          value={updateContent}
          placeholder="New Message Content"
          onChange={(e) => setUpdateContent(e.target.value)}
        />
        <button type="submit" disabled={!updateMessageID}>Update Message</button>
      </form>

      {/* Delete Message */}
      <h3>Delete Message</h3>
      <input
        type="text"
        value={deleteMessageID}
        placeholder="Message ID"
        onChange={(e) => setDeleteMessageID(e.target.value)}
      />
      <button onClick={handleDeleteMessage} disabled={!deleteMessageID}>
        Delete Message
      </button>

      {/* Filter Messages by Receiver */}
      <h3>Filter Messages by Receiver</h3>
      <form onSubmit={handleFilterMessagesByReceiver}>
        <input
          type="text"
          value={receiverID}
          placeholder="Receiver ID"
          onChange={(e) => setReceiverID(e.target.value)}
        />
        <button type="submit">Filter Messages</button>
      </form>

      {/* Filter Messages by Sender */}
      <h3>Filter Messages by Sender</h3>
      <form onSubmit={handleFilterMessagesBySender}>
        <input
          type="text"
          value={senderID}
          placeholder="Sender ID"
          onChange={(e) => setSenderID(e.target.value)}
        />
        <button type="submit">Filter Messages</button>
      </form>

      {filteredMessages.length > 0 && (
        <div>
          <h4>Filtered Messages</h4>
          <ul>
            {filteredMessages.map((msg) => (
              <li key={msg.messageID}>
                <strong>{msg.title}</strong>: {msg.content} (Sent by: {msg.sender})
              </li>
            ))}
          </ul>
        </div>
      )}

      {showErrorModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <div className={styles.modalButtons}>
              <button onClick={handleCloseErrorModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
