'use client'; // This marks the component as a Client Component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Correct import from next/navigation
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter(); // using useRouter from next/navigation

  useEffect(() => {
    const token = localStorage.getItem('token'); 

    if (token) {
      router.push('/HomePage'); // Redirect to homepage if token is present
    }
  }, [router]);

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
