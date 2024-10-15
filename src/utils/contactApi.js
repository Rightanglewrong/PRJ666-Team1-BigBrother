const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

// Fetch contacts
export const fetchContacts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/contacts`, { method: 'GET' });
  
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
  
      const data = await response.json();
      return data.contacts; // Ensure that returning the `contacts` array
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error; // Propagate the error to handle it in the frontend
    }
  };

// Add a new contact
export const addContact = async (newContact) => {
    try {
      const response = await fetch(`${BACKEND_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContact),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add contact');
      }
  
      const data = await response.json();
      return data.contact; // Assuming `contact` is returned after creation
    } catch (error) {
      console.error("Error adding contact:", error);
      throw error;
    }
  };

// Update an existing contact
export const updateContact = async (updatedContact) => {
    try {
      const response = await fetch(`${BACKEND_URL}/contacts/${updatedContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContact),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update contact');
      }
  
      const data = await response.json();
      return data.updatedContact; // Ensure the backend returns `updatedContact`
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  };

// Delete a contact
export const deleteContact = async (contactId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/contacts/${contactId}`, { method: 'DELETE' });
  
      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }
  
      return { success: true };
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
};
