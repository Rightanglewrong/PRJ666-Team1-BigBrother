'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/authenticate';
import Link from 'next/link';
import CustomCard from '../../components/Card/CustomCard';
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
  Box,
} from '@mui/material';
import {
  getUsersByAccountTypeAndLocation,
  approveUser,
  deleteUserInDynamoDB,
} from '../../utils/userAPI';
import styles from '../HomePage.module.css';

const AdminPage = () => {
  const user = useUser();
  const router = useRouter();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch pending users when the page loads
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const accountTypes = ['Staff', 'Admin']; // Include both Staff and Admin
        const promises = accountTypes.map((type) =>
          getUsersByAccountTypeAndLocation(type, user.locationID)
        );

        const responses = await Promise.all(promises);

        // Consolidate users from all responses
        const allUsers = responses.flatMap((response) => (response?.users ? response.users : []));

        // Filter users with PENDING status
        const pending = allUsers.filter((u) => u.accStatus === 'PENDING');

        setPendingUsers(pending);

        // Open modal if there are pending users
        if (pending.length > 0) {
          setIsModalOpen(true);
        }
      } catch (error) {
        console.error('Error fetching pending users:', error);

        // Handle invalid or expired token
        if (error.message === `Error fetching users: {"message":"Invalid or expired token"}`) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      }
    };

    if (user && user.accountType === 'Admin') {
      fetchPendingUsers();
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('token');
      router.push('/login');
    } else if (user.accountType !== 'Admin') {
      router.push('/');
    }
  }, [user, router]);

  const handleApproveUser = async (userID) => {
    try {
      await approveUser(userID);
      setPendingUsers((prev) => prev.filter((u) => u.userID !== userID));
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleDenyUser = async (userID) => {
    try {
      await deleteUserInDynamoDB(userID);
      setPendingUsers((prev) => prev.filter((u) => u.userID !== userID));
    } catch (error) {
      console.error('Error denying user:', error);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  if (!user || user.accountType !== 'Admin') {
    return (
      <Typography variant="h5" className={styles.error}>
        Unauthorized Access
      </Typography>
    );
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.floatingCard}>
        {/* Button to trigger the Pending Users Modal */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Button
            variant="contained"
            color="warning"
            onClick={() => setIsModalOpen(true)}
            disabled={pendingUsers.length === 0}
            sx={{ mt: 2 }}
          >
            {`Show Pending Users ${pendingUsers.length > 0 ? `(${pendingUsers.length})` : ''}`}
          </Button>
        </Box>
        <h1 className={styles.title}>Admin Dashboard</h1>

        {/* Pending Users Modal */}
        <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>Pending Users</DialogTitle>
          <DialogContent>
            {pendingUsers.length > 0 ? (
              <List>
                {pendingUsers.map((user) => (
                  <ListItem key={user.userID} divider>
                    <ListItemText
                      primary={
                        <>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            User Role: {user.accountType}
                          </Typography>
                          <Typography variant="body1">
                            Name: {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Email: {user.email}
                          </Typography>
                        </>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleApproveUser(user.userID)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDenyUser(user.userID)}
                      >
                        Deny
                      </Button>
                    </Box>
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
              <Link href="/admin/adminChild">
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
