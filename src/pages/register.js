import styles from './register.module.css';

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Register</h1>
      <form className={styles.form}>
        <label className={styles.label} htmlFor="username">Username</label>
        <input className={styles.input} type="text" id="username" name="username" required />

        <label className={styles.label} htmlFor="email">Email</label>
        <input className={styles.input} type="email" id="email" name="email" required />

        <label className={styles.label} htmlFor="password">Password</label>
        <input
          className={styles.input}
          type="password"
          id="password"
          name="password"
          placeholder="At least 6 characters"
          required
        />
        <small className={styles.hint}>
          <i>Passwords must be at least 6 characters.</i>
        </small>

        <label className={styles.label} htmlFor="confirmPassword">Re-enter password</label>
        <input className={styles.input} type="password" id="confirmPassword" name="confirmPassword" required />

        <button type="submit" className={styles.button}>Sign Up</button>
      </form>
    </div>
  );
}
