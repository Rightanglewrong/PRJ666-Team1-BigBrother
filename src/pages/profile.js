import { useState } from 'react';

export default function ProfilePage() {
  const [email, setEmail] = useState('parent@example.com');
  const [phone, setPhone] = useState('123-456-7890');

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log('Updating contact info', { email, phone });
  };

  return (
    <div>
      <h1>Profile</h1>
      <form onSubmit={handleUpdate}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Phone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button type="submit">Update Info</button>
      </form>
    </div>
  );
}
