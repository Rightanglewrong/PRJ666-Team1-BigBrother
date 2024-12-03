'use client'; // Ensure this is a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, IconButton, Menu, Button, Divider } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useUser } from '../components/authenticate';
import styles from './NavBar.module.css';
import { useTheme } from '@/components/ThemeContext'; // Import the theme context

const NavBar = () => {
  const { firstName, accountType } = useUser() || {};
  const [anchorEl, setAnchorEl] = useState(null); // Controls dropdown menu
  const router = useRouter();
  const { colorblindMode, setMode } = useTheme(); // Access colorblind mode and setter

  const isLoggedIn = !!firstName; // Checks if user data is present to determine login status

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
            ? 'linear-gradient(90deg, #70a1d7, #b8e986)' // Accessible palette
            : colorblindMode === 'blue-yellow'
            ? 'linear-gradient(90deg, #e77f24, #3db48c)' // Accessible palette
            : backgroundColor, // Default gradient
        transition: 'background 0.3s ease-in-out',
        padding: '5px 20px',
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
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href={isLoggedIn ? '/HomePage' : '/'} passHref>
            <Button
              color="inherit"
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.8rem' }, // Slightly smaller font size for mobile
                fontWeight: 'bold',
                textTransform: 'none',
                color: '#fff',
                textDecoration: 'none',
                paddingLeft: 0, // Remove default padding for extra alignment
              }}
            >
              Big Brother
            </Button>
          </Link>
        </Typography>

        {/* <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '0 10px',
          }}
        >
          <Select
            value={colorblindMode}
            onChange={(e) => setMode(e.target.value)}
            sx={{
              '& .MuiPaper-root': {
                background: menuBackgroundColor,
                color: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '& .MuiMenuItem-root': {
                  padding: '8px 16px',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#444',
                  },
                },
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#333',
                  color: '#fff',
                  borderRadius: '8px',
                  '& .MuiMenuItem-root': {
                    '&:hover': {
                      backgroundColor: '#555',
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="none">No Colorblind</MenuItem>
            <MenuItem value="red-green">Red-Green Mode</MenuItem>
            <MenuItem value="blue-yellow">Blue-Yellow Mode</MenuItem>
          </Select>
        </Box> */}

        {/* Right Section */}
        {isLoggedIn && (
          <>
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

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{
                '& .MuiPaper-root': {
                  background:
                    colorblindMode === 'red-green'
                      ? 'linear-gradient(90deg, #70a1d7, #b8e986)' // Red-Green mode colors
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
                Profile
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

              {(accountType === 'Parent' || accountType === 'Staff') && (
                <Link
                  href="/generalMediaGallery"
                  passHref
                  className={styles.dropdownItem}
                  onClick={handleMenuClose}
                >
                  Media
                </Link>
              )}

              {(accountType === 'Parent' || accountType === 'Staff') && (
                <Link
                  href="/userChildren"
                  passHref
                  className={styles.dropdownItem}
                  onClick={handleMenuClose}
                >
                  Child Profiles
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

              {(accountType === 'Admin') && (
                <Link
                  href="/admin/adminMedia"
                  passHref
                  className={styles.dropdownItem}
                  onClick={handleMenuClose}
                >
                  Admin Media Upload
                </Link>
              )}

              {(accountType === 'Staff') && (
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
