import { useState } from 'react';
import { useRouter } from 'next/router';
import { login, checkUser } from '../utils/api';  // Import checkUser function
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login(email, password);
      if (result.token) {
        localStorage.setItem('token', result.token);

        // Call the checkUser function after successful login
        const checkUserResult = await checkUser(email);

        // Redirect based on the checkUser result
        if (checkUserResult.hasAccountDetails) {
          router.push('/dashboard');  // If fields are present, go to dashboard
        } else {
          router.push('/profile');  // If fields are missing, go to profile
        }
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
      <a href="/forgot-password" className={styles['footer-link']}>Forgot password?</a>
    </div>
  );
}
