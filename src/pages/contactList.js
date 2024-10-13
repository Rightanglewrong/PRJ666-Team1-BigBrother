import React, { useState, useEffect } from "react";
import styles from "./contact.module.css";
import { fetchContacts, addContact, updateContact, deleteContact } from "../utils/contactApi"; // Import API calls
import { withAuth } from "@/hoc/withAuth";

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [newContact, setNewContact] = useState({
    id: null,
    name: "",
    phone: "",
    email: "",
    relationship: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false); 

  useEffect(() => {
    // Fetch contacts from backend when component mounts
    const loadContacts = async () => {
      try {
        const fetchedContacts = await fetchContacts();
        setContacts(fetchedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    loadContacts();
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/-/g, ""));

  const handleSaveContact = async () => {
    if (!validateEmail(newContact.email)) {
      setMessage("Invalid email format.");
      return;
    }
    if (!validatePhone(newContact.phone)) {
      setMessage("Invalid phone number format. It must contain 10 digits.");
      return;
    }

    try {
      if (editingContact) {
        await updateContact(newContact); // Send PUT request to backend
        setContacts(contacts.map(c => (c.id === newContact.id ? newContact : c)));
        setMessage("Contact updated successfully!");
      } else {
        const addedContact = await addContact(newContact); // Send POST request to backend
        setContacts([...contacts, addedContact]);
        setMessage("Contact added successfully!");
      }

      setNewContact({ id: null, name: "", phone: "", email: "", relationship: "", address: "" });
      setEditingContact(null);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      setMessage('Error saving contact');
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await deleteContact(id); // Send DELETE request to backend
      setContacts(contacts.filter(c => c.id !== id));
      setMessage("Contact deleted successfully!");
    } catch (error) {
      console.error("Error deleting contact:", error);
      setMessage("Error deleting contact");
    }
  };

  const handleInputChange = (e) => setNewContact({ ...newContact, [e.target.name]: e.target.value });

  const handleAddContactClick = () => {
    setIsAdding(true);
    setEditingContact(null);
    setNewContact({ id: null, name: "", phone: "", email: "", relationship: "", address: "" });
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setNewContact(contact);
    setIsAdding(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h2 className={styles.h2Custom}>Contacts</h2>
        <ul className={styles.ulCustom}>
          {contacts.length > 0 ? contacts.map((contact) => (
            <li key={contact.id} className={styles.contactItem}>
              {editingContact && editingContact.id === contact.id ? (
                <div className={styles.editForm}>
                  <input type="text" name="name" value={newContact.name} onChange={handleInputChange} required />
                  <input type="text" name="phone" value={newContact.phone} onChange={handleInputChange} required />
                  <input type="email" name="email" value={newContact.email} onChange={handleInputChange} required />
                  <input type="text" name="relationship" value={newContact.relationship} onChange={handleInputChange} required />
                  <input type="text" name="address" value={newContact.address} onChange={handleInputChange} required />
                  <button onClick={handleSaveContact}>Save</button>
                  <button onClick={() => setEditingContact(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <h3>{contact.name}</h3>
                  <p>Phone: {contact.phone}</p>
                  <p>Email: {contact.email}</p>
                  <p>Relationship: {contact.relationship}</p>
                  <p>Address: {contact.address}</p>
                  <button onClick={() => handleEditClick(contact)}>Edit</button>
                  <button onClick={() => handleDeleteContact(contact.id)}>Delete</button>
                </div>
              )}
            </li>
          )) : (
            <p>No contacts available</p>
          )}
        </ul>

        {isAdding && (
          <div className={styles.editForm}>
            <input type="text" name="name" value={newContact.name} onChange={handleInputChange} required />
            <input type="text" name="phone" value={newContact.phone} onChange={handleInputChange} required />
            <input type="email" name="email" value={newContact.email} onChange={handleInputChange} required />
            <input type="text" name="relationship" value={newContact.relationship} onChange={handleInputChange} required />
            <input type="text" name="address" value={newContact.address} onChange={handleInputChange} required />
            <button onClick={handleSaveContact}>Add</button>
            <button onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        )}

        {message && <p>{message}</p>}

        {!isAdding && <button onClick={handleAddContactClick}>Add Contact</button>}
      </div>
    </div>
  );
};

export default withAuth(ContactList);
