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
        email: '',
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

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
        try {
            const response = await deleteUserInDynamoDB(userID);
            setResult(response.message);
            setError(null);
            await handleGetUsersByAccountTypeAndLocation();
        } catch (error) {
            const errorMessage = "Error Deleting User"
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

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">User List</Typography>
                <Paper elevation={2} sx={{ maxHeight: 300, overflow: 'auto', mt: 2, p: 2 }}>
                    {usersList.length > 0 ? (
                        <List>
                            {usersList.map((user) => (
                                <ListItem
                                    key={user.userID}
                                    button
                                    selected={userID === user.userID}
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <ListItemText
                                        primary={`${user.firstName} ${user.lastName}`}
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="textSecondary">
                                                    {user.email}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {user.accountType}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="textSecondary">No users found</Typography>
                    )}
                </Paper>
            </Box>

            {isAdmin && (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6">Update User</Typography>
                        <Box display="flex" flexDirection="column" gap={2} mt={2}>
                            <TextField
                                label="First Name"
                                variant="outlined"
                                value={updateData.firstName}
                                onChange={(e) => setUpdateData((prev) => ({ ...prev, firstName: e.target.value }))}
                                fullWidth
                            />
                            <TextField
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
                                    label="Account Type" // This binds the label to the Select input
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
                        </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6">Delete User</Typography>
                        <TextField
                            label="User ID"
                            variant="outlined"
                            value={userID}
                            onChange={(e) => setUserID(e.target.value)}
                            fullWidth
                        />
                        <Button variant="contained" color="error" onClick={handleDeleteUser} sx={{ mt: 2 }}>
                            Delete User
                        </Button>
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
