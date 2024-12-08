'use client'; // Ensure this is a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, IconButton, Menu, Button, Divider, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import { useUser } from '../components/authenticate';
import styles from './NavBar.module.css';
import { useTheme } from '@/components/ThemeContext'; // Import the theme context

import { useMediaQuery, useTheme as MuiTheme } from '@mui/material';

const NavBar = () => {
  const { firstName, accountType } = useUser() || {};
  const [anchorEl, setAnchorEl] = useState(null); // Controls dropdown menu
  const router = useRouter();
  const { colorblindMode, setMode } = useTheme(); // Access colorblind mode and setter

  const isLoggedIn = !!firstName; // Checks if user data is present to determine login status

  const muiTheme = MuiTheme(); // Use Material-UI theme to access breakpoints
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm')); // Check if screen size is small

  const logo = '/icons/logo.png';

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const accountColors = {
    Admin: 'linear-gradient(90deg, #6a11cb, #2575fc)', // Existing color
    Parent: 'linear-gradient(90deg, #388E3C, #66BB6A)', // Gradient green for Parent
    Staff: 'linear-gradient(90deg, #FFA000, #FFC107)', // Darker yellow for Staff
  };

  const backgroundColor = accountColors[accountType] || accountColors.Admin;

  // Define menu background colors for each account type
  const accountMenuColors = {
    Admin: 'linear-gradient(90deg, #f52ad3f4, #25dcfce4)', // Existing color for Admin
    Parent: 'linear-gradient(90deg, #388E3C, #A5D6A7)', // Similar green gradient for Parent
    Staff: 'linear-gradient(90deg, #FFA000, #FFCA28)', // Matching yellow gradient for Staff
  };

  // Set the background based on the account type
  const menuBackgroundColor = accountMenuColors[accountType] || accountMenuColors.Admin;

  return (
    <AppBar
      position="sticky"
      sx={{
        background:
          colorblindMode === 'red-green'
            ? 'linear-gradient(90deg, #70a1d7, #e6e986)' // Accessible palette
            : colorblindMode === 'blue-yellow'
            ? 'linear-gradient(90deg, #e77f24, #3db48c)' // Accessible palette
            : backgroundColor, // Default gradient
        transition: 'background 0.3s ease-in-out',
        zIndex: 1000,
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Logo Section */}
        <Link href={isLoggedIn ? '/HomePage' : '/'} passHref>
          <Box
            component="img"
            src={logo}
            alt="Big Brother Logo"
            sx={{
              mt: 0.7,
              height: { xs: 40, sm: 50 }, // Increase height for mobile (xs) and larger screens (sm)
              width: 'auto', // Automatically adjusts the width to keep aspect ratio
              cursor: 'pointer', // Ensure it still acts as a clickable link
            }}
          />
        </Link>

        {/* Right Section */}
        {isLoggedIn && (
          <>
            {isMobile ? (
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    color: '#fbc531',
                  },
                }}
              >
                <DensityMediumIcon />
              </IconButton>
            ) : (
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    color: '#fbc531',
                  },
                }}
              >
                <AccountCircleIcon />
                <Typography
                  variant="body1"
                  sx={{
                    marginLeft: 1,
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  Welcome, {firstName}
                </Typography>
              </IconButton>
            )}

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{
                '& .MuiPaper-root': {
                  background:
                    colorblindMode === 'red-green'
                      ? 'linear-gradient(90deg, #70a1d7, #e6e986)' // Red-Green mode colors
                      : colorblindMode === 'blue-yellow'
                      ? 'linear-gradient(90deg, #e77f24, #3db48c)' // Blue-Yellow mode colors
                      : menuBackgroundColor, // Default menu background color
                  color: '#fff',
                  borderRadius: '4px',
                  minWidth: '160px',
                },
              }}
            >
              <Link
                href="/profile"
                passHref
                className={styles.dropdownItem}
                onClick={handleMenuClose}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 0.5 : 1, // No gap on mobile for the icon
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span>Profile</span>
                  {isMobile && <AccountCircleIcon />} {/* Show icon only on mobile */}
                </Box>
              </Link>
              <Link
                href="/calendar"
                passHref
                className={styles.dropdownItem}
                onClick={handleMenuClose}
              >
                Calendar
              </Link>

              {(accountType === 'Parent' || accountType === 'Staff') && (
                <div>
                  <Link
                    href="/progressReport"
                    passHref
                    className={styles.dropdownItem}
                    onClick={handleMenuClose}
                  >
                    Progress Report
                  </Link>
                </div>
              )}

              {accountType === 'Staff' && (
                <div>
                  <Link
                    href="/relationship"
                    passHref
                    className={styles.dropdownItem}
                    onClick={handleMenuClose}
                  >
                    Relationships
                  </Link>
                </div>
              )}

              {accountType === 'Parent' && (
                <Link
                  href="/generalMediaGallery"
                  passHref
                  className={styles.dropdownItem}
                  onClick={handleMenuClose}
                >
                  Media
                </Link>
              )}

              {accountType === 'Staff' && (
                <Link
                  href="/admin/staffGallery"
                  passHref
                  className={styles.dropdownItem}
                  onClick={handleMenuClose}
                >
                  Media
                </Link>
              )}

              {accountType === 'Parent' && (
                <Link
                  href="/userChildren"
                  passHref
                  className={styles.dropdownItem}
                  onClick={handleMenuClose}
                >
                  Child Profiles
                </Link>
              )}
              {accountType === 'Staff' && (
                <Link
                  href="/admin/staffChildProfiles"
                  passHref
                  className={styles.dropdownItem}
                  onClick={handleMenuClose}
                >
                  View Child Profiles
                </Link>
              )}

              <Link
                href="/mealPlan"
                passHref
                className={styles.dropdownItem}
                onClick={handleMenuClose}
              >
                Meal Plan
              </Link>

              <Link
                href="/newsletter"
                passHref
                className={styles.dropdownItem}
                onClick={handleMenuClose}
              >
                Newsletter
              </Link>

              <Link
                href="/message"
                passHref
                className={styles.dropdownItem}
                onClick={handleMenuClose}
              >
                Messages
              </Link>

              {accountType === 'Admin' && (
                <Link
                  href="/admin/adminMedia"
                  passHref
                  className={styles.dropdownItem}
                  onClick={handleMenuClose}
                >
                  Admin Media Upload
                </Link>
              )}

              {accountType === 'Staff' && (
                <Link
                  href="/staffMedia"
                  passHref
                  className={styles.dropdownItem}
                  onClick={handleMenuClose}
                >
                  Staff Media Upload
                </Link>
              )}

              {accountType === 'Admin' && (
                <Link
                  href="/admin"
                  passHref
                  className={styles.dropdownItem}
                  onClick={handleMenuClose}
                >
                  Admin Services
                </Link>
              )}

              <Divider sx={{ my: 1, backgroundColor: 'white' }} />
              <Link
                href="/settings"
                passHref
                className={styles.dropdownItem}
                onClick={handleMenuClose}
              >
                Settings
              </Link>
              <Link
                href="#"
                passHref
                className={styles.dropdownItem}
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                  handleMenuClose();
                }}
              >
                Logout
              </Link>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
