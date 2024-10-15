import { useState, useEffect } from 'react';
import {
  createMessageInDynamoDB,
  retrieveMessageFromDynamoDB,
  deleteMessageFromDynamoDB,
  retrieveMessageByReceiverID,
  retrieveMessageBySenderID,
  markMessageAsDeletedByReceiver,
  markMessageAsDeletedBySender,
} from '../utils/messageAPI';
import { getCurrentUser } from '../utils/api';
import styles from "./calendar.module.css";

export default function Message() {
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [createReceiverID, setCreateReceiverID] = useState('');
  const [senderID, setSenderID] = useState('');
  const [filterReceiverID, setFilterReceiverID] = useState('');
  const [retrieveMessageID, setRetrieveMessageID] = useState('');
  const [deleteReceiverMessageID, setDeleteReceiverMessageID] = useState('');
  const [deleteSenderMessageID, setDeleteSenderMessageID] = useState('');
  const [retrievedMessage, setRetrievedMessage] = useState(null);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [userId, setUserId] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

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
    try {
      const newMessage = {
        title: messageTitle,
        content: messageContent,
        sender: userId,
        receiver: createReceiverID,
      };

      const data = await createMessageInDynamoDB(newMessage);
      setMessage(`Message created successfully: ${JSON.stringify(data.item)}`);
      setMessageTitle('');
      setMessageContent('');
      setCreateReceiverID('');
    } catch (error) {
      setMessage(`Error creating message: ${error.message}`);
    }
  };

  const handleRetrieveMessage = async (e) => {
    e.preventDefault();
    try {
      const data = await retrieveMessageFromDynamoDB(retrieveMessageID);
      setRetrievedMessage(data.item);
      setMessage(`Message retrieved successfully: ${JSON.stringify(data.item)}`);      setRetrieveMessageID('');
    } catch (error) {
      setMessage(`Error retrieving message: ${error.message}`);
    }
  };

  const handleDeleteReceiverMessage = async (e) => {
    e.preventDefault();

    try {
      const data = await markMessageAsDeletedByReceiver(deleteReceiverMessageID);
      setMessage('Message deleted successfully');
      setDeleteReceiverMessageID('');
    } catch (error) {
      setMessage(`Error deleting message: ${error.message}`);
    }
  };

  const handleDeleteSenderMessage = async (e) => {
    e.preventDefault();

    try {
      const data = await markMessageAsDeletedBySender(deleteSenderMessageID);
      setMessage('Message deleted successfully');
      setDeleteSenderMessageID('');
    } catch (error) {
      setMessage(`Error deleting message: ${error.message}`);
    }
  };

  const handleFilterMessagesByReceiver = async (e) => {
    e.preventDefault();
    try {
      const messages = await retrieveMessageByReceiverID(filterReceiverID);
      setFilteredMessages(messages);
      setMessage(`Found ${messages.length} messages for receiver ID: ${filterReceiverID}`);
    } catch (error) {
      setMessage(`Error fetching messages: ${error.message}`);
    }
  };

  const handleFilterMessagesBySender = async (e) => {
    e.preventDefault();
    try {
      const messages = await retrieveMessageBySenderID(senderID);
      setFilteredMessages(messages);
      setMessage(`Found ${messages.length} messages for sender ID: ${senderID}`);
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
          value={createReceiverID}
          placeholder="Receiver ID"
          onChange={(e) => setCreateReceiverID(e.target.value)}
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

      {/* Delete For Receiver Message */}
      <h3>Delete For Receiver</h3>
      <input
        type="text"
        value={deleteReceiverMessageID}
        placeholder="Message ID"
        onChange={(e) => setDeleteReceiverMessageID(e.target.value)}
      />
      <button onClick={handleDeleteReceiverMessage} disabled={!deleteReceiverMessageID}>
        Delete Message
      </button>

        {/* Delete for Sender Message */}
        <h3>Delete For Sender</h3>
      <input
        type="text"
        value={deleteSenderMessageID}
        placeholder="Message ID"
        onChange={(e) => setDeleteSenderMessageID(e.target.value)}
      />
      <button onClick={handleDeleteSenderMessage} disabled={!deleteSenderMessageID}>
        Delete Message
      </button>

      {/* Filter Messages by Receiver */}
      <h3>Filter Messages by Receiver</h3>
      <form onSubmit={handleFilterMessagesByReceiver}>
        <input
          type="text"
          value={filterReceiverID}
          placeholder="Receiver ID"
          onChange={(e) => setFilterReceiverID(e.target.value)}
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
