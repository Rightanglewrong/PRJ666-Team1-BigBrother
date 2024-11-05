'use client'; // Ensure this is a Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Button } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { getCurrentUser } from '../utils/api';
import { Divider } from "@mui/material";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState(''); 
  const [accountType, setAccountType] = useState('');
  const [anchorEl, setAnchorEl] = useState(null); // Controls dropdown menu
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const userDetails = await getCurrentUser(); 
          setFirstName(userDetails.firstName);
          setAccountType(userDetails.accountType);
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setFirstName('');
    router.push('/');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(90deg, #6a11cb, #2575fc)",
        padding: "5px 20px",
        zIndex: 1000,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo Section */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href={isLoggedIn ? "/HomePage" : "/"} passHref>
            <Button
              color="inherit"
              sx={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                textTransform: "none",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Big Brother
            </Button>
          </Link>
        </Typography>

        {/* Right Section */}
        {isLoggedIn ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                color: "#fff",
                fontWeight: 600,
                '&:hover': {
                  transform: "translateY(-2px)",
                  color: "#fbc531",
                }
              }}
            >
              <AccountCircleIcon />
              <Typography
                variant="body1"
                sx={{
                  marginLeft: 1,
                  color: "#fff",
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
                "& .MuiPaper-root": {
                  background: "linear-gradient(90deg, #f52ad3f4, #25dcfce4)",
                  color: "#fff",
                  borderRadius: "4px",
                  minWidth: "160px",
                },
              }}
            >
              <MenuItem onClick={handleMenuClose} sx={{ "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" } }}>
                <Link href="/profile">Profile</Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" } }}>
                <Link href="/calendar">Calendar</Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" } }}>
                <Link href="/contact">Contact List</Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" } }}>
                <Link href="/mealPlan">Meal Plan</Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" } }}>
                <Link href="/newsletter">Newsletter</Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" } }}>
                <Link href="/message">Messages</Link>
              </MenuItem>

              {(accountType === 'Admin' || accountType === 'Staff') && (
                <>
                  <MenuItem onClick={handleMenuClose} sx={{ "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" } }}>
                    <Link href="/crudTester">Crud Testing</Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose} sx={{ "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" } }}>
                    <Link href="/dynamoCrudTester">Dynamo CRUD Testing</Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose} sx={{ "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" } }}>
                    <Link href="/executiveServices" className={styles.dropdownItem}>Executive Services</Link>
                  </MenuItem>
                </>
              )}

              {/* Divider line before Logout */}
              <Divider sx={{ my: 1, backgroundColor: "white" }} />

              <MenuItem onClick={handleMenuClose} sx={{ "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" } }}>
                <Link href="/examplePage">Example Page</Link>
              </MenuItem>

              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "white",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.3s ease", // Smooth transition for hover effect
                  "&:hover": {
                    background: "linear-gradient(90deg, #ff512f, #f09819)",
                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)", // Enhanced shadow on hover
                    transform: "scale(1.05)", // Slight scale-up effect on hover
                  },
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Typography variant="body1" sx={{ color: "#fff", fontWeight: 600 }}>
            You are not logged in
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;