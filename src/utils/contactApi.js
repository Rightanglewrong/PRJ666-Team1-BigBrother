import { getCurrentUser } from './api';  // Import the function to get the current user details

const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/v1";

// Fetch contacts by userID
export const fetchContacts = async (userID) => {
  try {
    const response = await fetch(`${BACKEND_URL}/contacts/userID?userID=${userID}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`No contacts available.`);
    }

    const data = await response.json();
    return data.entries;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

// Add a new contact
export const addContact = async (newContact) => {
  try {
    const currentUser = await getCurrentUser(); // Fetch the current user

    if (!currentUser || !currentUser.userID) {
      throw new Error("User ID is missing");
    }

    const contactData = {
      userID: currentUser.userID, // Attach the userID from the current user
      firstName: newContact.firstName,
      lastName: newContact.lastName,
      phoneNumber: newContact.phoneNumber,
      relationship: newContact.relationship,
      address: newContact.address,
    };

    const response = await fetch(`${BACKEND_URL}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      // Extract error details from the response
      const errorData = await response.json();
      console.error('Error data:', errorData);  // Log error details for debugging
      throw new Error(errorData.message || 'Failed to add contact');
    }

    const data = await response.json();
    return data.contact;
  } catch (error) {
    console.error('Error adding contact:', error.message);  // Improved error logging
    throw new Error(error.message || 'An unknown error occurred while adding the contact.');
  }
};


// Update an existing contact
export const updateContact = async (contactID, updatedContact) => {
  try {
    const response = await fetch(`${BACKEND_URL}/contacts/${contactID}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedContact),
    });

    if (!response.ok) {
      throw new Error("Failed to update contact");
    }

    const data = await response.json();
    return data.updatedContact;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

// Delete a contact
export const deleteContact = async (contactID) => {
  try {
    const response = await fetch(`${BACKEND_URL}/contacts/${contactID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json(); // Parse the response body

    if (!response.ok) {
      // Check if the server provides an error message and throw that for better feedback
      const errorMessage = data.error?.message || "Failed to delete contact";
      throw new Error(errorMessage);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};
