"use client"
import { Auth } from 'aws-amplify';
import styles from './page.module.css';

export default function Home() {
  const handleLogin = async () => {
    try {
      // This will redirect to Cognito hosted login page
      await Auth.federatedSignIn();
    } catch (error) {
      console.error("Error during federated sign in:", error);
    }
  };

  const handleRegister = async () => {
    try {
      // This will redirect to Cognito hosted signup page
      const signUpUrl = 'https://big-brother2-pool.auth.us-east-1.amazoncognito.com/signup?client_id=69n73oh4j7t8ou9f1u9sqs8e3g&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fprj-666-team1-big-brother.vercel.app%2Fdashboard';
      window.location.href = signUpUrl; // Redirect to signup
    } catch (error) {
      console.error("Error during registration redirect:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Welcome to Big Brother App</h1>
        <p className={styles.description}>Easily manage and stay connected with your childcare services.</p>
        <br />
        <div className={styles.buttonContainer}>
          <button onClick={handleLogin} className={styles.button}>Login</button>
          <button onClick={handleRegister} className={styles.button}>Register</button>
        </div>
      </div>
    </div>
  );
}
