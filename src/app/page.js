import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Welcome to Big Brother App</h1>
        <p className={styles.description}>Easily manage and stay connected with your childcare services.</p>
        <br />
        <div className={styles.buttonContainer}>
          <Link href="/login">
            <button className={styles.button}>Login</button>
          </Link>
          <Link href="/register">
            <button className={styles.button}>Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
