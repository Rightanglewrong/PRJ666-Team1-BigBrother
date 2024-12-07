import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  Typography,
  Box,
} from '@mui/material';

const ModalComponent = ({ isOpen, onClose, pendingUsers, onApprove, onDeny }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          height: { xs: '50vh', sm: 'auto' },
          width: { xs: '90%', sm: '600px' },
          margin: { xs: '10px auto', sm: 'auto' },
          padding: { xs: 2, sm: 4 },
          borderRadius: 4,
        },
      }}
    >
      <DialogTitle>Pending Users</DialogTitle>
      <DialogContent>
        {pendingUsers.length > 0 ? (
          <List>
            {pendingUsers.map((user) => (
              <ListItem
                key={user.userID}
                divider
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                  }}
                >
                  {/* Left Section: User Info */}
                  <Box sx={{ flex: 1, marginBottom: { xs: 2, sm: 0 } }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        marginBottom: '4px',
                      }}
                    >
                      Role: {user.accountType}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                      }}
                    >
                      Name: {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Email: {user.email}
                    </Typography>
                  </Box>

                  {/* Right Section: Buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#1565c0' },
                      }}
                      onClick={() => onApprove(user.userID)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#f44336',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#d32f2f' },
                      }}
                      onClick={() => onDeny(user.userID)}
                    >
                      Deny
                    </Button>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No pending users.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#1976d2' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalComponent;
