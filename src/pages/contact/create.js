import React, { useState } from 'react';
import { addContact } from '../../utils/contactApi';
import styles from './contact.module.css';
import { useRouter } from 'next/router';

const CreateContact = () => {
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleInputChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addContact(newContact);
      setMessage('Contact added successfully.');
      router.push('/contact');
    } catch (error) {
      setMessage('Error adding contact.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create New Contact</h2>
      {message && <p>{message}</p>}
      <div>
        <input
          type="text"
          name="name"
          value={newContact.name}
          onChange={handleInputChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="phone"
          value={newContact.phone}
          onChange={handleInputChange}
          placeholder="Phone"
        />
        <input
          type="email"
          name="email"
          value={newContact.email}
          onChange={handleInputChange}
          placeholder="Email"
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
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default CreateContact;
