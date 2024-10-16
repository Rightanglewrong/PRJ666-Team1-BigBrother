import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signup } from '../utils/api';
import Link from 'next/link'; // Import Link from next/link
import styles from './register.module.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [locationID, setLocationID] = useState('');
  const [accountType, setAccountType] = useState('Parent');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState(''); // State for email error message
  const [accountTypeError, setAccountTypeError] = useState(''); // State for account type error message
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token'); // Check if token exists
    if (token) {
      localStorage.removeItem('token'); // Remove token from localStorage
      window.location.reload(); // Reload the page
    }
  }, []);


  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$]).{6,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (email) => {
    // Regular expression to check for an email with "@" and "."
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address in the format: name@domain.extension.');
      return;
    } else {
      setEmailError(''); // Clear error if email is valid
    }

    if (accountTypeError) {
      alert('Please fix the errors before submitting.');
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (!validatePassword(password)) {
      alert("Password must be at least 6 characters, contain at least one uppercase letter, one lowercase letter, and one special character (!@#$).");
      return;
    }

    const signupData = { firstName, lastName, email, locationID, accountType, password };

    try {
      await signup(signupData);
      alert('Registration successful!');

      // Redirect to dashboard after successful registration
      window.location.href = '/dashboard'; 
    } catch (error) {
      console.error('Error during signup:', error.message);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Register</h1>
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
        {emailError && <small className={styles.error}>{emailError}</small>} {/* Display email error if present */}

        <label className={styles.label} htmlFor="FirstName">First Name</label>
        <input
          className={styles.input}
          type="text"
          id="firstName"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label className={styles.label} htmlFor="LastName">Last Name</label>
        <input
          className={styles.input}
          type="text"
          id="lastName"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <label className={styles.label} htmlFor="LocationID">Location ID</label>
        <input
          className={styles.input}
          type="text"
          id="locationID"
          name="locationID"
          value={locationID}
          onChange={(e) => setLocationID(e.target.value)}
          required
        />

        <label className={styles.label} htmlFor="AccountType">Account Type</label>
        <select
          className={styles.input}
          id="accountType"
          name="accountType"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          required
        >
          <option value="Parent">Parent</option>
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
        </select>
        {accountTypeError && <small className={styles.error}>{accountTypeError}</small>}

        <label className={styles.label} htmlFor="password">Password</label>
        <input
          className={styles.input}
          type="password"
          id="password"
          name="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <small className={styles.hint}>
          <i>Passwords must be at least 6 characters, include 1 uppercase letter, 1 lowercase letter, and 1 symbol (!@#$).</i>
        </small>

        <label className={styles.label} htmlFor="confirmPassword">Re-enter password</label>
        <input
          className={styles.input}
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" className={styles.button}>Sign Up</button>
        <Link href="/login" className={styles['footer-link']}>
          Already have an account?
        </Link>
      </form>
    </div>
  );
}
