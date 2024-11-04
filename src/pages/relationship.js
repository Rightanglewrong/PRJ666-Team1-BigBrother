import { useState } from 'react';
import {
  createRelationshipInDynamoDB,
  getRelationshipFromDynamoDB,
  updateRelationshipInDynamoDB,
  deleteRelationshipFromDynamoDB,
  getRelationshipByChildID,
  getRelationshipByParentID
} from '../utils/api';

export default function RelationshipCrudTest() {
  const [relationship, setRelationship] = useState({});
  const [relationshipId, setRelationshipId] = useState('');
  const [childID, setChildID] = useState('');
  const [parentID, setParentID] = useState('');
  const [message, setMessage] = useState('');
  const [fetchedRelationship, setFetchedRelationship] = useState(null);

  // Handle creating a relationship
  const handleCreateRelationship = async (e) => {
    e.preventDefault();
    try {
      const response = await createRelationshipInDynamoDB(relationship);
      setMessage(response.message);
      setFetchedRelationship(response.item);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Handle retrieving a relationship by ID
  const handleGetRelationship = async () => {
    try {
      const data = await getRelationshipFromDynamoDB({ id: relationshipId });
      setFetchedRelationship(data);
      setMessage("Relationship retrieved successfully");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Handle updating a relationship
  const handleUpdateRelationship = async (e) => {
    e.preventDefault();
    try {
      const response = await updateRelationshipInDynamoDB(relationshipId, relationship);
      setMessage(response.message);
      setFetchedRelationship(response.item);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Handle deleting a relationship
  const handleDeleteRelationship = async () => {
    try {
      const response = await deleteRelationshipFromDynamoDB({ id: relationshipId });
      setMessage(response.message);
      setFetchedRelationship(null);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Retrieve relationships by child ID
  const handleGetRelationshipsByChildID = async () => {
    try {
      const data = await getRelationshipByChildID(childID);
      setFetchedRelationship(data);
      setMessage("Relationships retrieved successfully for child ID");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Retrieve relationships by parent ID
  const handleGetRelationshipsByParentID = async () => {
    try {
      const data = await getRelationshipByParentID(parentID);
      setFetchedRelationship(data);
      setMessage("Relationships retrieved successfully for parent ID");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1>Relationship CRUD Test Page</h1>
        <p>{message}</p>

        <h2>Create Relationship</h2>
        <form onSubmit={handleCreateRelationship}>
          <input type="text" placeholder="Child ID" onChange={(e) => setRelationship({ ...relationship, childID: e.target.value })} />
          <input type="text" placeholder="Parent ID" onChange={(e) => setRelationship({ ...relationship, parentID: e.target.value })} />
          <button type="submit">Create Relationship</button>
        </form>

        <h2>Get Relationship by ID</h2>
        <input type="text" placeholder="Relationship ID" value={relationshipId} onChange={(e) => setRelationshipId(e.target.value)} />
        <button onClick={handleGetRelationship}>Get Relationship</button>

        <h2>Update Relationship</h2>
        <form onSubmit={handleUpdateRelationship}>
          <input type="text" placeholder="Relationship ID" value={relationshipId} onChange={(e) => setRelationshipId(e.target.value)} />
          <input type="text" placeholder="New Child ID" onChange={(e) => setRelationship({ ...relationship, childID: e.target.value })} />
          <input type="text" placeholder="New Parent ID" onChange={(e) => setRelationship({ ...relationship, parentID: e.target.value })} />
          <button type="submit">Update Relationship</button>
        </form>

        <h2>Delete Relationship</h2>
        <input type="text" placeholder="Relationship ID" value={relationshipId} onChange={(e) => setRelationshipId(e.target.value)} />
        <button onClick={handleDeleteRelationship}>Delete Relationship</button>

        <h2>Get Relationships by Child ID</h2>
        <input type="text" placeholder="Child ID" value={childID} onChange={(e) => setChildID(e.target.value)} />
        <button onClick={handleGetRelationshipsByChildID}>Get by Child ID</button>

        <h2>Get Relationships by Parent ID</h2>
        <input type="text" placeholder="Parent ID" value={parentID} onChange={(e) => setParentID(e.target.value)} />
        <button onClick={handleGetRelationshipsByParentID}>Get by Parent ID</button>

        {fetchedRelationship && (
          <div>
            <h3>Fetched Relationship:</h3>
            <pre>{JSON.stringify(fetchedRelationship, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
