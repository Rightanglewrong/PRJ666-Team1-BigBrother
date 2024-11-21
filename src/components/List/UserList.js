// components/List/UserList.js
import React from 'react';
import { List, ListItem, ListItemText, Typography, Button, Box } from '@mui/material';

const UserList = ({ users, selectedUserId, onSelect, onViewContacts, onDelete }) => {
  if (!users || users.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        No users found
      </Typography>
    );
  }

  return (
    <List>
      {users.map((user) => (
        <ListItem
          key={user.userID}
          selected={selectedUserId === user.userID}
          onClick={() => onSelect(user)}
          sx={{
            backgroundColor:
              selectedUserId === user.userID ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
            '&:hover': { backgroundColor: 'rgba(0, 0, 255, 0.1)' },
            cursor: 'pointer',
          }}
        >
          <ListItemText
            primary={
              <Box>
                <Typography variant="body1" component="span">
                  {`${user.firstName} ${user.lastName}`}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="div">
                  {user.email}
                </Typography>
              </Box>
            }
            secondary={
              <Typography variant="caption" color="textSecondary">
                {user.accountType}
              </Typography>
            }
          />
          <Box>
            <Button
              color="info"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering onSelect
                onViewContacts(user);
              }}
              sx={{ marginRight: 1 }}
            >
              View Contacts
            </Button>
            <Button
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(user);
              }}
            >
              Delete
            </Button>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default UserList;
