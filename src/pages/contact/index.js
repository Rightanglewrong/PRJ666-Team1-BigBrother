import React, { useState, useEffect } from "react";
import { addContact, fetchContacts } from "@/utils/contactApi"; // Adjust the import path if necessary
import { getCurrentUser } from "@/utils/api"; // Adjust the import path if necessary
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
      const currentUser = await getCurrentUser();  // Fetch the current user
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
  
      await addContact(newContactData);
      setMessage("Contact added successfully!");
  
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
      setIsAdding(false);
    } catch (error) {
      setMessage(`Error adding contact: ${error.message}`);  // Display readable error
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
        {message && <p>{message}</p>}

        <ul className={styles.ulCustom}>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <li key={contact.contactID} className={styles.contactItem}>
                <div>
                  <h3>{contact.firstName} {contact.lastName}</h3>
                  <p>Phone: {contact.phoneNumber}</p>
                  <p>Email: {contact.email}</p>
                  <p>Relationship: {contact.relationship}</p>
                  <p>Address: {contact.address}</p>
                </div>
              </li>
            ))
          ) : (
            <p>No contacts available</p>
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
            <button onClick={handleSaveContact}>Save</button>
            <button onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        )}

        {!isAdding && <button onClick={() => setIsAdding(true)}>Add Contact</button>}
      </div>
    </div>
  );
};

export default ContactList;
