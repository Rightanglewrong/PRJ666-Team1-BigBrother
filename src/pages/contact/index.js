import React, { useState, useEffect } from "react";
import {
  addContact,
  fetchContacts,
  updateContact,
  deleteContact,
} from "@/utils/contactApi";
import { getCurrentUser } from "@/utils/api";
import styles from "./contact.module.css";

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    contactID: null,
    firstName: "",
    lastName: "",
    phoneNumber: "",
    relationship: "",
    address: "",
  });
  const [editingContact, setEditingContact] = useState(null); // Track contact being edited
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Fetch contacts when the component mounts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const user = await getCurrentUser(); // Fetch current user details
        const fetchedContacts = await fetchContacts(user.userID); // Fetch contacts for the user
        setContacts(fetchedContacts);
      } catch (error) {
        setMessage(error.message || "Error fetching contacts.");
      }
    };
    loadContacts();
  }, []);

  // Function to save a new contact
  const handleSaveContact = async () => {
    try {
      const currentUser = await getCurrentUser(); // Fetch the current user
      if (!currentUser || !currentUser.userID) {
        setMessage("User ID is missing.");
        return;
      }

      const newContactData = {
        userID: currentUser.userID, // Include the userID
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        phoneNumber: newContact.phoneNumber,
        relationship: newContact.relationship,
        address: newContact.address,
      };

      if (editingContact) {
        // Update existing contact
        await updateContact(editingContact.contactID, newContactData);
        setMessage("Contact updated successfully!");
      } else {
        // Add new contact
        await addContact(newContactData);
        setMessage("Contact added successfully!");
      }

      // Optionally refresh the contacts list
      const updatedContacts = await fetchContacts(currentUser.userID);
      setContacts(updatedContacts);

      // Reset form after successful add
      setNewContact({
        contactID: null,
        firstName: "",
        lastName: "",
        phoneNumber: "",
        relationship: "",
        address: "",
      });
      setEditingContact(null);
      setIsAdding(false);
    } catch (error) {
      setMessage(`Error adding/updating contact: ${error.message}`); // Display readable error
    }
  };

  // Function to edit a contact
  const handleEditClick = (contact) => {
    setNewContact(contact); // Load the selected contact into the form
    setEditingContact(contact); // Track the contact being edited
    setIsAdding(true); // Show the form
  };

  // Function to delete a contact
  const handleDeleteContact = async (contactID) => {
    try {
      await deleteContact(contactID);

      // Remove the contact from the state after successful deletion
      setContacts((prevContacts) =>
        prevContacts.filter((c) => c.contactID !== contactID)
      );

      setMessage("Contact deleted successfully!");
    } catch (error) {
      setMessage(`Error deleting contact: ${error.message}`);
    }
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h2 className={styles.h2Custom}>Contacts</h2>
        {message && <p className={styles.message}>{message}</p>}

        <ul className={styles.ulCustom}>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <li key={contact.contactID} className={styles.contactItem}>
                <div className={styles.contactInfo}>
                  <h3>
                    {contact.firstName} {contact.lastName}
                  </h3>
                  <p>Phone: {contact.phoneNumber}</p>
                  <p>Relationship: {contact.relationship}</p>
                  <p>Address: {contact.address}</p>
                  </div>
                  <div className={styles.buttonContainer}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditClick(contact)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteContact(contact.contactID)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className={styles.otherMessage}>You can add contacts by selecting the Add Contact button</p>
          )}
        </ul>

        {isAdding && (
          <div className={styles.editForm}>
            <input
              type="text"
              name="firstName"
              value={newContact.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              required
            />
            <input
              type="text"
              name="lastName"
              value={newContact.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              required
            />
            <input
              type="text"
              name="phoneNumber"
              value={newContact.phoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number"
              required
            />
            <input
              type="text"
              name="relationship"
              value={newContact.relationship}
              onChange={handleInputChange}
              placeholder="Relationship"
            />
            <input
              type="text"
              name="address"
              value={newContact.address}
              onChange={handleInputChange}
              placeholder="Address"
            />
            <button className={styles.saveButton} onClick={handleSaveContact}>
              Save
            </button>
            <button
              className={styles.cancelButton}
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
          </div>
        )}

        {!isAdding && (
          <button
            className={styles.addButton}
            onClick={() => setIsAdding(true)}
          >
            Add Contact
          </button>
        )}
      </div>
    </div>
  );
};

export default ContactList;
