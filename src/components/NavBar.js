"use client"; // Ensure this is a Client Component

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Divider,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useUser } from "../components/authenticate";
import styles from "./NavBar.module.css";

const NavBar = () => {
  const { firstName, accountType } = useUser() || {};
  const [anchorEl, setAnchorEl] = useState(null); // Controls dropdown menu
  const router = useRouter();

  const isLoggedIn = !!firstName; // Checks if user data is present to determine login status

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const accountColors = {
    Admin: "linear-gradient(90deg, #6a11cb, #2575fc)", // Existing color
    Parent: "linear-gradient(90deg, #388E3C, #66BB6A)", // Gradient green for Parent
    Staff: "linear-gradient(90deg, #FFA000, #FFC107)",  // Darker yellow for Staff
  };

  const backgroundColor = accountColors[accountType] || accountColors.Admin;

  // Define menu background colors for each account type
  const accountMenuColors = {
    Admin: "linear-gradient(90deg, #f52ad3f4, #25dcfce4)", // Existing color for Admin
    Parent: "linear-gradient(90deg, #388E3C, #A5D6A7)",     // Similar green gradient for Parent
    Staff: "linear-gradient(90deg, #FFA000, #FFCA28)",      // Matching yellow gradient for Staff
  };

  // Set the background based on the account type
  const menuBackgroundColor = accountMenuColors[accountType] || accountMenuColors.Admin;

  return (
    <AppBar
      position="sticky"
      sx={{
        background: backgroundColor,
        padding: "5px 20px",
        zIndex: 1000,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
                "&:hover": {
                  transform: "translateY(-2px)",
                  color: "#fbc531",
                },
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
            {/* <Menu
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
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" },
                }}
              >
                <Link href="/profile">Profile</Link>
              </MenuItem>

              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" },
                }}
              >
                <Link href="/calendar">Calendar</Link>
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" },
                }}
              >
                <Link href="/contact">Contact List</Link>
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" },
                }}
              >
                <Link href="/mealPlan">Meal Plan</Link>
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" },
                }}
              >
                <Link href="/newsletter">Newsletter</Link>
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" },
                }}
              >
                <Link href="/message">Messages</Link>
              </MenuItem>
              {(accountType === "Admin" || accountType === "Staff") && (
                <div>
                  <MenuItem
                    onClick={handleMenuClose}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#ffcf4d",
                        color: "#9318a5",
                      },
                    }}
                  >
                    <Link href="/admin">Admin Services</Link>
                  </MenuItem>
                </div>
              )}
              {/* Divider line before Logout */}
            {/* <Divider sx={{ my: 1, backgroundColor: "white" }} /> 
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  "&:hover": { backgroundColor: "#ffcf4d", color: "#9318a5" },
                }}
              >
                <Link href="/examplePage">Example Page</Link>
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "white",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(90deg, #ff512f, #f09819)",
                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                Logout
              </MenuItem>
            </Menu> */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{
                "& .MuiPaper-root": {
                  background: menuBackgroundColor,  // Apply background based on account type
                  color: "#fff",
                  borderRadius: "4px",
                  minWidth: "160px",
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
              <Link
                href="/contact"
                passHref
                className={styles.dropdownItem}
                onClick={handleMenuClose}
              >
                Contact List
              </Link>

              {(accountType === "Parent") && (
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

              <Link
                href="/media"
                passHref
                className={styles.dropdownItem}
                onClick={handleMenuClose}
              >
                Media
              </Link>
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

              {(accountType === "Admin" || accountType === "Staff") && (
                <div>
                  <Link
                    href="/crudTester"
                    passHref
                    className={styles.dropdownItem}
                    onClick={handleMenuClose}
                  >
                    Crud Testing
                  </Link>
                  <Link
                    href="/admin"
                    passHref
                    className={styles.dropdownItem}
                    onClick={handleMenuClose}
                  >
                    Admin Services
                  </Link>
                </div>
              )}

              <Divider sx={{ my: 1, backgroundColor: "white" }} />

              <Link
                href="/examplePage"
                passHref
                className={styles.dropdownItem}
                onClick={handleMenuClose}
              >
                Example Page
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
