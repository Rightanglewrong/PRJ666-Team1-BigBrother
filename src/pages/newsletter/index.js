// src/pages/newsletter/index.js

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/utils/api";
import { getAllNewsletters } from "@/utils/newsletterAPI";
import styles from "./Newsletter.module.css";

export default function NewsletterIndex() {
  const [newsletters, setNewsletters] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // State to store user details

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User is not authenticated");
      return;
    }

    async function fetchNewsletters() {
      try {
        const user = await getCurrentUser(token);
        setUser(user); // Set the user details

        const newsletters = await getAllNewsletters(token, user.locationID);
        // Sort newsletters by `createdAt` in descending order (newest first)
        const sortedNewsletters = newsletters.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNewsletters(sortedNewsletters);
        setLoading(false);
      } catch (error) {
        if (error.message === "404: No Newsletters currently") {
          setMessage("");
        } else {
          setMessage(`${error}`);
        }
        setLoading(false);
      }
    }

    fetchNewsletters();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Show loading state while fetching user details
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.h1style}>Newsletters</h1>
        {message && <p className={styles.message}>{message}</p>}

        {newsletters.length > 0 ? (
          newsletters.map((newsletter) => (
            <div key={newsletter.newsletterID} className={styles.newsletter}>
              <h3>{newsletter.title}</h3>
              <p>{newsletter.content}</p>
              <p className={styles.newsletterDate}>{newsletter.createdAt}</p>
              <div className={styles.buttonGroup}>
                <Link href={`/newsletter/${newsletter.newsletterID}`}>
                  <button className={`${styles.button} ${styles.expandButton}`}>
                    Expand
                  </button>
                </Link>
              </div>
              <br></br>
            </div>
          ))
        ) : (
          <p className={styles.noNewsletters}>No newsletters found.</p>
        )}
        <br></br>

        {user && (user.accountType === "Admin" || user.accountType === "Staff") && (
        <Link href="/newsletter/create">
          <button className={`${styles.button} ${styles.createButton}`}>
            Create New Newsletter
          </button>
        </Link>
        )}
      </div>
    </div>
  );
}
