'use client'; // Ensure this is a Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./NavBar.module.css";
import { getCurrentUser } from '../utils/api';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState(''); 
  const [accountType, setAccountType] = useState(''); // Track account type (e.g., parent)
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
          setAccountType(userDetails.accountType); // Set account type (e.g., parent)
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
      } else {
        setIsLoggedIn(false);
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
      localStorage.removeItem('userLoggedIn');
      window.dispatchEvent(new Event('storage'));
      setIsLoggedIn(false);
      setFirstName('');
      window.location.href = '/';
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
        {/* Logo */}
        <div className={styles.leftSection}>
          {/* Conditionally link based on login status */}
          <Link href={isLoggedIn ? "/homepage/HomePage" : "/"} className={styles.logo}>
            Big Brother
          </Link>
        </div>

        {/* Right Section */}
        <div className={styles.rightSection}>
          <ul className={styles.navList}>
            {isLoggedIn ? (
              <div className={styles.dropdown} onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown}>
                <span className={styles.navItem}>
                  Welcome, {firstName} {dropdownOpen ? '▲' : '▼'}
                </span>
                {dropdownOpen && (
                  <ul className={styles.dropdownMenu}>
                  <li><Link href="/profile" className={styles.dropdownItem}>Profile</Link></li>
                  <li><Link href="/calendar" className={styles.dropdownItem}>Calendar</Link></li>
                  <li><Link href="/contactList" className={styles.dropdownItem}>Contact List</Link></li>
                  <li><Link href="/mealPlan" className={styles.dropdownItem}>Meal Plan</Link></li>
                  <li><Link href="/progressReport" className={styles.dropdownItem}>Progress Report</Link></li>
                  <li><Link href="/newsletter" className={styles.dropdownItem}>Newsletter</Link></li>


                  {(accountType === 'Admin' || accountType === 'Staff') && (
                    <>
                      <li><Link href="/crudTester" className={styles.dropdownItem}>Crud Testing</Link></li>
                      <li><Link href="/dynamoCrudTester" className={styles.dropdownItem}>Dynamo CRUD Testing</Link></li>
                    </>
                  )}
                    <li>
                      <button onClick={handleLogout} className={styles.dropdownItem}>
                        Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              // Message for not logged in users
              <span className={styles.navItem}>You are not logged in</span>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
