import React, { useState, useEffect } from 'react';
import {
    retrieveUserByIDInDynamoDB,
    updateUserInDynamoDB,
    deleteUserInDynamoDB,
    getUsersByAccountTypeAndLocation
} from '../../utils/userAPI';
import { getCurrentUser } from '@/utils/api';

const UserCrudTester = () => {
    const [userID, setUserID] = useState('');
    const [accountType, setAccountType] = useState('');
    const [locationID, setLocationID] = useState('');
    const [updateData, setUpdateData] = useState({});
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if ( currentUser.accountType === 'Admin') {
            setIsAdmin(true);
        } else if (currentUser.accountType === 'Staff') {
            setIsAdmin(false);
        }
    }, []);

    const handleRetrieveUser = async () => {
        try {
            const user = await retrieveUserByIDInDynamoDB({ id: userID });
            setResult(user);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleUpdateUser = async () => {
        try {
            const response = await updateUserInDynamoDB(userID, updateData);
            setResult(response);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteUser = async () => {
        try {
            const response = await deleteUserInDynamoDB(userID);
            setResult(response);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleGetUsersByAccountTypeAndLocation = async () => {
        try {
            const users = await getUsersByAccountTypeAndLocation(accountType, locationID);
            setUsersList(users);
            handleReset();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleUserSelect = (user) => {
        setUserID(user.userID);
        setUpdateData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            locationID: user.locationID
        });
    };

    const handleReset = () => {
        setAccountType('');
        setLocationID('');
    };

    return (
        <div>
            <h2>User CRUD Tester</h2>

            {/* Get Users by Account Type and Location */}
            <div>
                <h3>Get Users by Account Type and Location</h3>
                <select
                    value={accountType}
                    onChange={(e) => {
                        setAccountType(e.target.value);
                    }}
                >
                    <option value="">Select Account Type</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Parent">Parent</option>
                </select>
                <input
                    type="text"
                    placeholder="Location ID"
                    value={locationID}
                    onChange={(e) => setLocationID(e.target.value)}
                />
                <button onClick={() => 
                    handleGetUsersByAccountTypeAndLocation(accountType, locationID)}>
                    Get Users
                </button>
            </div>

            {/* Display Users List */}
            <div>
                <h3>User List</h3>
                {usersList.length > 0 ? (
                    <ul>
                        {usersList.map((user) => (
                            <li key={user.userID} onClick={() => handleUserSelect(user)}>
                                {user.firstName} {user.lastName} - {user.accountType}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No users found</p>
                )}
            </div>

            {/* Admin Only: CRUD Operations */}
            {isAdmin && (
                <>
                    {/* Update User */}
                    <div>
                        <h3>Update User</h3>
                        <input
                            type="text"
                            placeholder="User ID"
                            value={userID}
                            onChange={(e) => setUserID(e.target.value)}
                        />
                        <textarea
                            placeholder="Update Data (JSON)"
                            value={JSON.stringify(updateData)}
                            onChange={(e) => setUpdateData(JSON.parse(e.target.value))}
                        />
                        <button onClick={handleUpdateUser}>Update User</button>
                    </div>

                    {/* Delete User */}
                    <div>
                        <h3>Delete User</h3>
                        <input
                            type="text"
                            placeholder="User ID"
                            value={userID}
                            onChange={(e) => setUserID(e.target.value)}
                        />
                        <button onClick={handleDeleteUser}>Delete User</button>
                    </div>
                </>
            )}

            {/* Display Result */}
            <div>
                <h3>Result</h3>
                {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );

}

export default UserCrudTester;
