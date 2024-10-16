import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchContactById, updateContact, deleteContact } from '../../utils/contactApi'; // Import necessary API calls
import styles from './contact.module.css';

const ContactDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [contact, setContact] = useState(null);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContactById(id).then(setContact).catch(() => setMessage('Error fetching contact.'));
    }
  }, [id]);

  const handleInputChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateContact(contact);
      setMessage('Contact updated successfully.');
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating contact.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContact(id);
      setMessage('Contact deleted successfully.');
      router.push('/contact');
    } catch (error) {
      setMessage('Error deleting contact.');
    }
  };

  if (!contact) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>{isEditing ? 'Edit Contact' : 'Contact Details'}</h2>
      {message && <p>{message}</p>}
      <div>
        <input
          type="text"
          name="name"
          value={contact.name}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <input
          type="text"
          name="phone"
          value={contact.phone}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <input
          type="email"
          name="email"
          value={contact.email}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <input
          type="text"
          name="relationship"
          value={contact.relationship}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <input
          type="text"
          name="address"
          value={contact.address}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        {isEditing ? (
          <div>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit</button>
        )}
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default ContactDetail;
