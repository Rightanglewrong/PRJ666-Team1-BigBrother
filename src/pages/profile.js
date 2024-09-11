import { useState } from 'react';
import styles from './Profile.module.css';

export default function ProfilePage() {
  const [email, setEmail] = useState('parent@example.com');
  const [phone, setPhone] = useState('123-456-7890');

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log('Updating contact info', { email, phone });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Profile</h1> {}
      <form className={styles.form} onSubmit={handleUpdate}> {}
        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className={styles.label}>Phone</label>
        <input
          className={styles.input}
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button className={styles.button} type="submit">Update Info</button>
      </form>
    </div>
  );
}
