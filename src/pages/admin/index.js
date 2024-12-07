'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/authenticate';
import Link from 'next/link';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Grid,
  Button,
} from '@mui/material';
import {
  getUsersByAccountTypeAndLocation,
  approveUser,
  deleteUserInDynamoDB,
} from '../../utils/userAPI';
import PendingUsersModal from '@/components/Modal/PendingUsersModal';
import { useTheme } from '@/components/ThemeContext';

const AdminPage = () => {
  const user = useUser();
  const router = useRouter();
  const { darkMode, colorblindMode } = useTheme(); // Access theme modes

  const [pendingUsers, setPendingUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cardColors = {
    cardBg: darkMode ? '#1e1e1e' : '#ffffff',
    cardHover: darkMode ? '#2a2a2a' : '#f7f7f7',
    textColor: darkMode ? '#f1f1f1' : '#333',
    hoverTextColor: darkMode ? '#ffffff' : '#1976d2',
  };

  // Fetch pending users when the page loads
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const accountTypes = ['Staff', 'Admin'];
        const promises = accountTypes.map((type) =>
          getUsersByAccountTypeAndLocation(type, user.locationID)
        );

        const responses = await Promise.all(promises);
        const allUsers = responses.flatMap((response) => (response?.users ? response.users : []));
        const pending = allUsers.filter((u) => u.accStatus === 'PENDING');
        console.log(pending);
        setPendingUsers(pending);

        if (pending.length > 0) {
          setIsModalOpen(true);
        }
      } catch (error) {
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

  const handleOpenModal = () => setIsModalOpen(true);

  if (!user || user.accountType !== 'Admin') {
    return (
      <Typography variant="h5" sx={{ color: darkMode ? '#f1f1f1' : '#333', textAlign: 'center' }}>
        Unauthorized Access
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: darkMode ? '#121212' : '#f7f9fc',
        color: darkMode ? '#f1f1f1' : '#333',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: { xs: 'none', sm: 4 },
        px: { xs: 'none', sm: 2 },
      }}
    >
      <Box
        sx={{
          backgroundColor: cardColors.cardBg,
          borderRadius: { xs: 'none', sm: 4 },
          boxShadow: { xs: 'none', sm: '0 8px 16px rgba(0, 0, 0, 0.2)' },
          p: 4,
          maxWidth: 900,
          width: '100%',
        }}
      >
        <Typography
          variant="h4"
          sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4, color: cardColors.textColor }}
        >
          Admin Dashboard
        </Typography>

        {/* Pending Users Button */}
        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <Button
            variant="outlined"
            disabled={pendingUsers.length === 0}
            onClick={handleOpenModal}
            sx={{
              borderColor: pendingUsers.length > 0 ? '#1976d2' : '#9e9e9e',
              color: pendingUsers.length > 0 ? '#1976d2' : '#9e9e9e',
              boxShadow: pendingUsers.length > 0 ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
              '&:hover': {
                borderColor: pendingUsers.length > 0 ? '#1565c0' : '#9e9e9e',
                boxShadow: pendingUsers.length > 0 ? '0 6px 12px rgba(0, 0, 0, 0.3)' : 'none',
              },
              backgroundColor: 'transparent', // Ensure the inside is uncolored
              cursor: pendingUsers.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {`Pending User(s) (${pendingUsers.length})`}
          </Button>
        </Box>

        <PendingUsersModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pendingUsers={pendingUsers}
          onApprove={handleApproveUser}
          onDeny={handleDenyUser}
        />

        <Grid container spacing={3}>
          {[
            { title: 'Activity Log', href: '/admin/activity-log', description: 'View logs' },
            {
              title: 'Progress Reports',
              href: '/admin/progressReport',
              description: 'Manage reports',
            },
            { title: 'Media', href: '/admin/mediaGallery', description: 'Manage media' },
            {
              title: 'Relationships',
              href: '/admin/relationship',
              description: 'Manage relationships',
            },
            {
              title: 'Children',
              href: '/admin/adminChild',
              description: 'Manage children profiles',
            },
            { title: 'Users', href: '/admin/user', description: 'Manage user profiles' },
          ].map(({ title, href, description }) => (
            <Grid item xs={12} sm={6} key={title}>
              <Link href={href} passHref>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: cardColors.cardBg,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                      backgroundColor: cardColors.cardHover,
                    },
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    {description}
                  </Typography>
                </Box>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminPage;
