import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Import Link from next/link
import { login } from '../utils/api'; 
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if a token is present in localStorage and redirect to dashboard if so
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/HomePage');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login(email, password);  // Call login function from utils/api.js
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userLoggedIn', 'true');
        window.dispatchEvent(new Event('storage'));  // Trigger the storage event manually
        // Redirect to homepage after successful login
        window.location.href = '/HomePage';
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Login</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input
          className={styles.input}
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className={styles.label} htmlFor="password">Password</label>
        <input
          className={styles.input}
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className={styles.button}>Log In</button>
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <br />
      <Link href="/forgot-password" className={styles['footer-link']}>
        Forgot password?
      </Link>
      <br />
      <Link href="/register" className={styles['footer-link']}>
        Register Now!
      </Link>
    </div>
  );
}
