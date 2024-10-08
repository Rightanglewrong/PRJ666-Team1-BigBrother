"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./NavBar.module.css";
import { getCurrentUser } from '../utils/api';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState(''); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  // Check user authentication status when the component is mounted
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const userDetails = await getCurrentUser(); 
          setFirstName(userDetails.firstName);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setIsLoggedIn(false);
      }
    };

    checkUserStatus();

    // Listen for storage events to trigger a refresh when the login status changes
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem('userLoggedIn') === 'true';
      if (loggedIn) {
        checkUserStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');  // Remove the token when logging out
      setIsLoggedIn(false);
      setFirstName('');
      router.push('/');  // Redirect to home page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Toggle dropdown menu visibility
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>
            Big Brother
          </Link>
          <ul className={styles.navList}>
            <li>
              <Link href="/dashboard" className={styles.navItem}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/profile" className={styles.navItem}>
                Profile
              </Link>
            </li>
            <li>
              <Link href="/media" className={styles.navItem}>
                Media
              </Link>
            </li>
            <li>
              <Link href="/calendar" className={styles.navItem}>
                {" "}
                Calendar{" "}
              </Link>
            </li>
            <li>
              <Link href="/contactList" className={styles.navItem}>
                {" "}
                Contact List{" "}
              </Link>
            </li>

            {/* Dropdown for Testing */}
            <li className={styles.navItem} onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown}>
              <span className={styles.dropdown}>Testing</span>
              {dropdownOpen && (
                <ul className={styles.dropdownMenu}>
                  <li><Link href="/crudTester" className={styles.dropdownItem}>Crud Testing</Link></li>
                  <li><Link href="/dynamoCrudTester" className={styles.dropdownItem}>Dynamo CRUD Testing</Link></li>
                </ul>
              )}
            </li>
          </ul>
        </div>

        

        <div className={styles.rightSection}>
          <ul className={styles.navList}>
            {isLoggedIn ? (
              <>
                <li className={styles.navItem}>Welcome, {firstName}</li>
                <li>
                  <button onClick={handleLogout} className={styles.button}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className={styles.navItem}>You are not logged in</li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
