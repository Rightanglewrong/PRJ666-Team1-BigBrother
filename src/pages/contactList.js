import React, { useState, useEffect } from "react";
import { withAuth } from "@/hoc/withAuth";
import styles from "./contact.module.css";

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
  const [isAdding, setIsAdding] = useState(false); // New state for adding a contact

  useEffect(() => {
    // Simulated API call to fetch contacts
    const fetchContacts = async () => {
      try {
        const fetchedContacts = await new Promise((resolve) =>
          setTimeout(
            () =>
              resolve([
                {
                  id: 1,
                  name: "Benny Yang",
                  phone: "123-456-7890",
                  email: "BennyYang@example.com",
                  relationship: "Parent",
                  address: "123 Main St",
                },
                {
                  id: 2,
                  name: "Justin Alex",
                  phone: "987-654-3210",
                  email: "JustinAlex@example.com",
                  relationship: "Emergency Contact",
                  address: "456 Maple St",
                },
              ]),
            1000
          )
        );
        setContacts(fetchedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/-/g, "")); // Allows for phone numbers with dashes

  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setNewContact(contact);
    setIsAdding(false); // Make sure it's not in 'add' mode when editing
  };

  const handleSaveContact = () => {
    if (!validateEmail(newContact.email)) {
      setMessage("Invalid email format.");
      return;
    }
    if (!validatePhone(newContact.phone)) {
      setMessage("Invalid phone number format. It must contain 10 digits.");
      return;
    }

    if (editingContact) {
      // Update existing contact
      const updatedContacts = contacts.map((contact) =>
        contact.id === newContact.id ? newContact : contact
      );
      setContacts(updatedContacts);
      setEditingContact(null);
      setMessage("Contact updated successfully!");
    } else {
      // Add new contact
      const newContactWithId = { ...newContact, id: contacts.length + 1 };
      setContacts([...contacts, newContactWithId]);
      setMessage("Contact added successfully!");
    }

    setNewContact({
      id: null,
      name: "",
      phone: "",
      email: "",
      relationship: "",
      address: "",
    });
    setIsAdding(false);
  };

  const handleDeleteContact = (id) => {
    const updatedContacts = contacts.filter((contact) => contact.id !== id);
    setContacts(updatedContacts);
    setMessage("Contact deleted successfully!");
  };

  const handleInputChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  const handleAddContactClick = () => {
    setIsAdding(true);
    setEditingContact(null); // Ensure editing is not active while adding
    setNewContact({
      id: null,
      name: "",
      phone: "",
      email: "",
      relationship: "",
      address: "",
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h2 className={styles.h2Custom}>Contacts</h2>

        <ul className={styles.ulCustom}>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <li key={contact.id} className={styles.contactItem}>
                {editingContact && editingContact.id === contact.id ? (
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      name="name"
                      value={newContact.name}
                      onChange={handleInputChange}
                      placeholder="Name"
                      required
                    />
                    <input
                      type="text"
                      name="phone"
                      value={newContact.phone}
                      onChange={handleInputChange}
                      placeholder="Phone"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      value={newContact.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      required
                    />
                    <input
                      type="text"
                      name="relationship"
                      value={newContact.relationship}
                      onChange={handleInputChange}
                      placeholder="Relationship"
                      required
                    />
                    <input
                      type="text"
                      name="address"
                      value={newContact.address}
                      onChange={handleInputChange}
                      placeholder="Address"
                      required
                    />
                    <button
                      onClick={handleSaveContact}
                      className={styles.saveButton}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingContact(null)}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3>{contact.name}</h3>
                    <p>Phone: {contact.phone}</p>
                    <p>Email: {contact.email}</p>
                    <p>Relationship: {contact.relationship}</p>
                    <p>Address: {contact.address}</p>
                    <button
                      onClick={() => handleEditClick(contact)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            <p>No contacts available</p>
          )}
        </ul>

        {/* Add Contact Form */}
        {isAdding && (
          <div className={styles.editForm}>
            <h3>Add New Contact</h3>
            <input
              type="text"
              name="name"
              value={newContact.name}
              onChange={handleInputChange}
              placeholder="Name"
              required
            />
            <input
              type="text"
              name="phone"
              value={newContact.phone}
              onChange={handleInputChange}
              placeholder="Phone"
              required
            />
            <input
              type="email"
              name="email"
              value={newContact.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
            <input
              type="text"
              name="relationship"
              value={newContact.relationship}
              onChange={handleInputChange}
              placeholder="Relationship"
              required
            />
            <input
              type="text"
              name="address"
              value={newContact.address}
              onChange={handleInputChange}
              placeholder="Address"
              required
            />
            <button onClick={handleSaveContact} className={styles.saveButton}>
              Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        )}

        {message && <p className={styles.message}>{message}</p>}

        {/* Add Contact Button */}
        {!isAdding && (
          <button onClick={handleAddContactClick} className={styles.addButton}>
            Add Contact
          </button>
        )}
      </div>
    </div>
  );
};

export default withAuth(ContactList);
