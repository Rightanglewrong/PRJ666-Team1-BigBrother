const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

// Create an Message in DynamoDB
export const createMessageInDynamoDB = async (item) => {
  const token = localStorage.getItem('token');

  if (!token) {
      throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}v1/message`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error("Error creating Message in DynamoDB");
    }

    const data = await response.json();
    return { message: "Message created successfully", item: data };
  } catch (error) {
    console.error("Error creating Message:", error);
    throw new Error(error.message);
  }
};

// Retrieve an Message from DynamoDB
export const retrieveMessageFromDynamoDB = async (item) => {
  const token = localStorage.getItem('token');

  if (!token) {
      throw new Error("No token found");
  }

  try {
      const response = await fetch(`${BACKEND_URL}v1/message/by-ID/${item.id}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Message not found");
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Error retrieving Message:", error);
    throw new Error(error.message);
  }
};

// Delete an Message from DynamoDB
export const deleteMessageFromDynamoDB = async (item) => {
  const token = localStorage.getItem('token');

  if (!token) {
      throw new Error("No token found");
  }
  try {
    const response = await fetch(`${BACKEND_URL}v1/message/${item.id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
        const errorDetails = await response.text(); 
        throw new Error('Error deleting Message from DynamoDB: ${errorDetails}');
    }

    const data = await response.json();
    return { message: "Message deleted successfully", data };
  } catch (error) {
    console.error("Error deleting Message:", error);
    throw new Error(error.message);
  }

  
};

export const retrieveMessageByReceiverID = async (receiverID) => {

  const token = localStorage.getItem('token');

  if (!token) {
      throw new Error("No token found");
  }
    try {
      const response = await fetch(`${BACKEND_URL}v1/message/receiver?receiverID=${receiverID}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error("No Messages found for the Receiver");
      }
  
      const data = await response.json();
      return data.entries; 
    } catch (error) {
      console.error("Error retrieving Messages for the Receiver:", error);
      throw new Error(error.message);
    }
};

export const retrieveMessageBySenderID = async (senderID) => {

  const token = localStorage.getItem('token');

  if (!token) {
      throw new Error("No token found");
  }
  try {
    const response = await fetch(`${BACKEND_URL}v1/message/sender?senderID=${senderID}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error("No Messages found for the Sender");
    }

    const data = await response.json();
    return data.entries; 
  } catch (error) {
    console.error("Error retrieving Messages for the Sender:", error);
    throw new Error(error.message);
  }
};