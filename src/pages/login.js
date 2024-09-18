import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Login</h1>
      <form className={styles.form}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input className={styles.input} type="email" id="email" name="email" required />

        <label className={styles.label} htmlFor="password">Password</label>
        <input className={styles.input} type="password" id="password" name="password" required />

        <button type="submit" className={styles.button}>Log In</button>
      </form>

    <br />
      <a href="/forgot-password" className={styles['footer-link']}>Forgot password?</a>
    </div>
  );
}
