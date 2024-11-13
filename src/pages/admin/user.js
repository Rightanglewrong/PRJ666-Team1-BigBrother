import React, { useState, useEffect } from 'react';
import { useRouter } from "next/router";
import {
    updateUserInDynamoDB,
    deleteUserInDynamoDB,
    getUsersByAccountTypeAndLocation
} from '../../utils/userAPI';
import { getCurrentUser } from '@/utils/api';
import {
    Container,
    Typography,
    Box,
    Snackbar,
    Alert,
    Button,
    TextField,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    Paper,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
} from "@mui/material"; 

const AdminUserService = () => {
    const router = useRouter();
    const [userID, setUserID] = useState('');
    const [accountType, setAccountType] = useState('');
    const [locationID, setLocationID] = useState('');
    const [updateData, setUpdateData] = useState({
        firstName: '',
        lastName: '',
        accountType: '',
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [openDeleteConfirmationDialog, setOpenDeleteConfirmationDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (currentUser.accountType === 'Admin') {
                    setIsAdmin(true);
                } else if (currentUser.accountType === 'Staff') {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error verifying Admin Status:", error);
            }
        };
        checkAdmin();
    }, []);

    const handleUpdateUser = async () => {
        try {
            const response = await updateUserInDynamoDB(userID, updateData);
            setResult(response.message);
            setError(null);
            await handleGetUsersByAccountTypeAndLocation();
        } catch (error) {
            const errorMessage = "Error Updating User"
            setError(errorMessage);
            setErrorModalOpen(true);
        }
    };

    const handleDeleteUser = async () => {
        if (updateData.accountType === 'Admin') {
            setError("Cannot delete an Admin user.");
            setErrorModalOpen(true);
            return;  
        } 
        setUserToDelete(userID);
        setOpenDeleteConfirmationDialog(true);
    }
    const handleConfirmDelete = async () => {
        if (!userToDelete) return; 
        try {
            const response = await deleteUserInDynamoDB(userToDelete);
            setResult(response.message);
            setError(null);
            await handleGetUsersByAccountTypeAndLocation();
            setOpenDeleteConfirmationDialog(false); 
        } catch (error) {
            const errorMessage = "Error Deleting User";
            setError(errorMessage);
            setErrorModalOpen(true);
        }
    };

    const handleGetUsersByAccountTypeAndLocation = async () => {
        try {
            const response = await getUsersByAccountTypeAndLocation(accountType, locationID);
            if (response.status === "ok") {
                setUsersList(response.users);
                setError(null);
                setUpdateData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    locationID: '',
                    accountType: '', // Clear previous user data
                });
                setUserID(null);
            } else {
                setError("Failed to retrieve users.");
                setErrorModalOpen(true);
            }
        } catch (error) {
            const errorMessage = "Account Type and Location ID are Required";
            setError(errorMessage);
            setErrorModalOpen(true);

        }
    };

    const handleUserSelect = (user) => {
        setUserID(user.userID);
        setUpdateData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            locationID: user.locationID,
            accountType: user.accountType
        });
    };

    const closeErrorModal = () => {
        setErrorModalOpen(false); 
    };

    const handleDialogClose = () => {
        setOpenDeleteConfirmationDialog(false); // Close dialog if user cancels
        setUserToDelete(null); // Reset the user to delete
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>User Management</Typography>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Get Users by Account Type and Location</Typography>
                <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <FormControl fullWidth variant="outlined">
                    <InputLabel>Account Type</InputLabel>                    <Select
                        label="Account Type"
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Staff">Staff</MenuItem>
                        <MenuItem value="Parent">Parent</MenuItem>
                    </Select>
                    </FormControl>
                    <TextField
                        label="Location ID"
                        variant="outlined"
                        value={locationID}
                        onChange={(e) => setLocationID(e.target.value)}
                        fullWidth
                    />
                    <Button variant="contained" color="primary" onClick={handleGetUsersByAccountTypeAndLocation}>
                        Get Users
                    </Button>
                </Box>
            </Box>

             {/* Error Modal */}
             <Dialog open={errorModalOpen} onClose={closeErrorModal}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {error}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeErrorModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={openDeleteConfirmationDialog} onClose={handleDialogClose}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the user{' '}
                    <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Confirm Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">User List</Typography>
                <Paper elevation={2} sx={{ maxHeight: 300, overflow: 'auto', mt: 2, p: 2 }}>
                    {usersList.length > 0 ? (
                        <List>
                            {usersList.map((user) => (
                                <ListItem
                                    key={user.userID}
                                    selected={userID === user.userID}
                                    onClick={() => handleUserSelect(user)}
                                    sx={{
                                        backgroundColor: userID === user.userID ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                                        '&:hover': { backgroundColor: 'rgba(0, 0, 255, 0.1)' },
                                        cursor: 'pointer', 
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="body1" component="span">  
                                                {`${user.firstName} ${user.lastName}`}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="textSecondary" component="span">  
                                                    {user.email}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" component="span">  
                                                    {user.accountType}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <Button color="secondary" onClick={() => handleUserSelect(user)} sx={{ marginRight: 1 }}>
                                        Update
                                    </Button>
                                    <Button color="error" onClick={() => handleDeleteUser(user)}>
                                        Delete
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="textSecondary">No users found</Typography>
                    )}
                </Paper>
            </Box>

            {isAdmin && userID && (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6">Update User</Typography>
                        <Box display="flex" flexDirection="column" gap={2} mt={2}>
                            <TextField
                                disabled={updateData.accountType === 'Admin'}
                                label="First Name"
                                variant="outlined"
                                value={updateData.firstName}
                                onChange={(e) => setUpdateData((prev) => ({ ...prev, firstName: e.target.value }))}
                                fullWidth
                            />
                            <TextField
                            disabled={updateData.accountType === 'Admin'}
                                label="Last Name"
                                variant="outlined"
                                value={updateData.lastName}
                                onChange={(e) => setUpdateData((prev) => ({ ...prev, lastName: e.target.value }))}
                                fullWidth
                            />
                           <FormControl fullWidth variant="outlined">
                                <InputLabel>Account Type</InputLabel>
                                <Select
                                    disabled={updateData.accountType === 'Admin'} // Disable if the accountType is Admin
                                    label="Account Type" 
                                    value={updateData.accountType}
                                    onChange={(e) => setUpdateData((prev) => ({ ...prev, accountType: e.target.value }))}
                                    fullWidth
                                >
                                    <MenuItem value="Admin">Admin</MenuItem>
                                    <MenuItem value="Staff">Staff</MenuItem>
                                    <MenuItem value="Parent">Parent</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" color="secondary" onClick={handleUpdateUser}>
                                Update User
                            </Button>
                            <Button variant="outlined" color="default" onClick={() => setUserID(null)} style={{ marginTop: '10px' }}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </>
            )}

            <Button
                variant="outlined"
                color="primary"
                onClick={() => router.push("/admin")} // Navigates to the admin page
                sx={{ textTransform: "none", mt: 2 }}
              >
                Back to Admin
              </Button>

            {result && (
                <Snackbar open={true} autoHideDuration={6000} onClose={() => setResult(null)}>
                    <Alert onClose={() => setResult(null)} severity="success" sx={{ width: '100%' }}>
                        {result}
                    </Alert>
                </Snackbar>
            )}
        </Container>
    );
}

export default AdminUserService;
