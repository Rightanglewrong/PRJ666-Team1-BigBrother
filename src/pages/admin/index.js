"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/authenticate";
import Link from "next/link";
import CustomCard from "../../components/Card/CustomCard";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  getUsersByAccountTypeAndLocation,
  approveUser,
} from "../../utils/userAPI";
import styles from "../HomePage.module.css";

const AdminPage = () => {
  const user = useUser();
  const router = useRouter();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch pending users when the page loads
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await getUsersByAccountTypeAndLocation(
          "Staff",
          user.locationID
        );
        if (response?.users) {
          const pending = response.users.filter(
            (u) => u.accStatus === "PENDING"
          );
          setPendingUsers(pending);
          if (pending.length > 0) {
            setIsModalOpen(true); // Open modal if there are pending users
          }
        }
      } catch (error) {
        console.log(error.message)
        if (error.message == `Error fetching users: {"message":"Invalid or expired token"}`) {
          localStorage.removeItem("token");
          router.push("/login");
        }
        console.error("Error fetching pending users:", error);
      }
    };

    if (user && user.accountType === "Admin") {
      fetchPendingUsers();
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem("token");
      router.push("/login");
    } else if (user.accountType !== "Admin") {
      router.push("/");
    }
  }, [user, router]);

  const handleApproveUser = async (userID) => {
    try {
      await approveUser(userID);
      setPendingUsers((prev) => prev.filter((u) => u.userID !== userID));
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  if (!user || user.accountType !== "Admin") {
    return (
      <Typography variant="h5" className={styles.error}>
        Unauthorized Access
      </Typography>
    );
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.floatingCard}>
        <h1 className={styles.title}>Admin Dashboard</h1>

        {/* Pending Users Modal */}
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Pending Users</DialogTitle>
          <DialogContent>
            {pendingUsers.length > 0 ? (
              <List>
                {pendingUsers.map((user) => (
                  <ListItem key={user.userID} divider>
                    <ListItemText
                      primary={`${user.firstName} ${user.lastName}`}
                      secondary={`Email: ${user.email}`}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApproveUser(user.userID)}
                    >
                      Approve
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No pending users found.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <div className={styles.gridSection}>
          {/* Activity Log */}
          <CustomCard
            title="Activity Log"
            content="View all administrative activity logs."
            actions={
              <Link href="/admin/activity-log">
                <Button size="small" color="primary">
                  Go to Activity Log
                </Button>
              </Link>
            }
          />

          {/* Progress Reports */}
          <CustomCard
            title="Progress Reports"
            content="Manage and view progress reports for children."
            actions={
              <Link href="/admin/progressReport">
                <Button size="small" color="primary">
                  Go to Progress Reports
                </Button>
              </Link>
            }
          />

          {/* Media */}
          <CustomCard
            title="Media"
            content="Upload and manage media files."
            actions={
              <Link href="/admin/mediaGallery">
                <Button size="small" color="primary">
                  Go to Media
                </Button>
              </Link>
            }
          />

          {/* Relationships */}
          <CustomCard
            title="Relationships"
            content="Manage relationships between children and guardians."
            actions={
              <Link href="/admin/relationship">
                <Button size="small" color="primary">
                  Go to Relationships
                </Button>
              </Link>
            }
          />

          {/* Children */}
          <CustomCard
            title="Children"
            content="View and manage children profiles."
            actions={
              <Link href="/admin/children">
                <Button size="small" color="primary">
                  Go to Children
                </Button>
              </Link>
            }
          />

          {/* Users */}
          <CustomCard
            title="Users"
            content="View and manage User profiles."
            actions={
              <Link href="/admin/user">
                <Button size="small" color="primary">
                  Go to Users
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
