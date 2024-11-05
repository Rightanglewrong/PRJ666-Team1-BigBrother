import { useState } from 'react';
import {
  createChildProfileInDynamoDB,
  retrieveChildProfileByID,
  updateChildProfileInDynamoDB,
  deleteChildProfileFromDynamoDB,
  retrieveChildrenByClassID,
  retrieveChildrenByLocationID
} from '../utils/childAPI';
import styles from "./crudTester.module.css";

export default function ChildCrudTest() {
  const [childData, setChildData] = useState({});
  const [childID, setChildID] = useState('');
  const [classID, setClassID] = useState('');
  const [locationID, setLocationID] = useState('');
  const [updateID, setUpdateID] = useState('');
  const [deleteID, setDeleteID] = useState('');
  const [message, setMessage] = useState('');
  const [fetchedChild, setFetchedChild] = useState(null);

  // Handle creating a child profile
  const handleCreateChild = async (e) => {
    e.preventDefault();
    if (!childData.firstName || !childData.lastName || !childData.classID) {
      setMessage("First Name, Last Name, Age, and Class ID are required.");
      return;
    }
    try {
      const response = await createChildProfileInDynamoDB(childData);
      setMessage(response.message);
      setFetchedChild(response.child);
      setChildData({});
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Handle retrieving a child profile by ID
  const handleGetChildByID = async () => {
    try {
      const data = await retrieveChildProfileByID(childID);
      setFetchedChild(data);
      setMessage("Child Profile retrieved successfully");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Handle updating a child profile
  const handleUpdateChild = async (e) => {
    e.preventDefault();
    try {
      const updatedData = { ...childData };
      const response = await updateChildProfileInDynamoDB(updateID, updatedData);
      setMessage(response.message);
      setFetchedChild(response.child);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Handle deleting a child profile
  const handleDeleteChild = async () => {
    try {
      const response = await deleteChildProfileFromDynamoDB(deleteID);
      setMessage(response.message);
      setFetchedChild(null);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Retrieve children by class ID
  const handleGetChildrenByClassID = async () => {
    try {
      const data = await retrieveChildrenByClassID(classID);
      setFetchedChild(data);
      setMessage("Children retrieved successfully for Class ID");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Retrieve children by location ID
  const handleGetChildrenByLocationID = async () => {
    try {
      const data = await retrieveChildrenByLocationID(locationID);
      setFetchedChild(data);
      setMessage("Children retrieved successfully for Location ID");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1>Child CRUD Test Page</h1>
        <p>{message}</p>

        <h2>Create Child Profile</h2>
        <form onSubmit={handleCreateChild}>
          <input type="text" placeholder="First Name" onChange={(e) => setChildData({ ...childData, firstName: e.target.value })} />
          <input type="text" placeholder="Last Name" onChange={(e) => setChildData({ ...childData, lastName: e.target.value })} />
          <input type="text" placeholder="Class ID" onChange={(e) => setChildData({ ...childData, classID: e.target.value })} />
          <input type="text" placeholder="Location ID" onChange={(e) => setChildData({ ...childData, locationID: e.target.value })} />
          <button type="submit">Create Child Profile</button>
        </form>

        <h2>Get Child Profile by ID</h2>
        <input type="text" placeholder="Child ID" value={childID} onChange={(e) => setChildID(e.target.value)} />
        <button onClick={handleGetChildByID}>Get Child Profile</button>

        <h2>Update Child Profile</h2>
        <form onSubmit={handleUpdateChild}>
          <input type="text" placeholder="Child ID" value={updateID} onChange={(e) => setUpdateID(e.target.value)} />
          <input type="text" placeholder="New First Name" onChange={(e) => setChildData({ ...childData, firstName: e.target.value })} />
          <input type="text" placeholder="New Last Name" onChange={(e) => setChildData({ ...childData, lastName: e.target.value })} />
          <input type="text" placeholder="New Class ID" onChange={(e) => setChildData({ ...childData, classID: e.target.value })} />
          <input type="text" placeholder="New Location ID" onChange={(e) => setChildData({ ...childData, locationID: e.target.value })} />
          <button type="submit">Update Child Profile</button>
        </form>

        <h2>Delete Child Profile</h2>
        <input type="text" placeholder="Child ID" value={deleteID} onChange={(e) => setDeleteID(e.target.value)} />
        <button onClick={handleDeleteChild}>Delete Child Profile</button>

        <h2>Get Children by Class ID</h2>
        <input type="text" placeholder="Class ID" value={classID} onChange={(e) => setClassID(e.target.value)} />
        <button onClick={handleGetChildrenByClassID}>Get by Class ID</button>

        <h2>Get Children by Location ID</h2>
        <input type="text" placeholder="Location ID" value={locationID} onChange={(e) => setLocationID(e.target.value)} />
        <button onClick={handleGetChildrenByLocationID}>Get by Location ID</button>

        {fetchedChild && (
          <div>
            <h3>Fetched Child Profile:</h3>
            <pre>{JSON.stringify(fetchedChild, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
