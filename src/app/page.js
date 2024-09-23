import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const cognitoLoginUrl = 'https://big-brother2-pool.auth.us-east-1.amazoncognito.com/login?client_id=69n73oh4j7t8ou9f1u9sqs8e3g&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fprj-666-team1-big-brother.vercel.app%2Fdashboard';
  const cognitoRegisterUrL = 'https://big-brother2-pool.auth.us-east-1.amazoncognito.com/signup?client_id=69n73oh4j7t8ou9f1u9sqs8e3g&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fprj-666-team1-big-brother.vercel.app%2Fdashboard'
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Welcome to Big Brother App</h1>
        <p className={styles.description}>Easily manage and stay connected with your childcare services.</p>
        <br />
        <div className={styles.buttonContainer}>
          <a href={cognitoLoginUrl}>
            <button className={styles.button}>Login</button>
          </a>
          <a href={cognitoRegisterUrL}>
            <button className={styles.button}>Register</button>
          </a>
        </div>
      </div>
    </div>
  );
}
