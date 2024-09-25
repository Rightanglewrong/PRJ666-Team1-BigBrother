import { useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter for navigation
import { signup } from '../utils/api';
import styles from './register.module.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [locationID, setLocationID] = useState('');
  const [accountType, setAccountType] = useState('1'); // Set default value of 1
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountTypeError, setAccountTypeError] = useState(''); // State for error message
  const router = useRouter();

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$]).{6,}$/;
    return passwordRegex.test(password);
  };

  // Handler for accountType input to allow only numbers between 1 and 4
  const handleAccountTypeChange = (e) => {
    const value = e.target.value;

    // Check if input is not a number or if it's out of range
    if (isNaN(value) || value < 1 || value > 4) {
      setAccountTypeError('Account type must be a number between 1 and 4.');
    } else {
      setAccountTypeError(''); // Clear error if input is valid
    }

    // Allow only numeric input and set the value
    setAccountType(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const signupData = { email, password, firstname, lastname, locationID, accountType };

    try {
      await signup(signupData);
      alert('Registration successful!');
      
      // Redirect to dashboard after successful registration
      router.push('/dashboard');
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

        <label className={styles.label} htmlFor="FirstName">First Name</label>
        <input
          className={styles.input}
          type="text"
          id="firstname"
          name="firstname"
          value={firstname}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label className={styles.label} htmlFor="LastName">Last Name</label>
        <input
          className={styles.input}
          type="text"
          id="lastname"
          name="lastname"
          value={lastname}
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
        <input
          className={styles.input}
          type="text" // Keep this as "text" to handle manual input validation
          id="accountType"
          name="accountType"
          value={accountType} // Default value set here
          onChange={handleAccountTypeChange}
          required
        />
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
      </form>
    </div>
  );
}
