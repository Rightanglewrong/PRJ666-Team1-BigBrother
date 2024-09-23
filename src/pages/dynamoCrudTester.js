import { useState } from 'react';
import {
  createItemInDynamoDB,
  retrieveItemFromDynamoDB,
  updateItemInDynamoDB,
  deleteItemFromDynamoDB,
} from '../utils/dynamoAPI'; 

export default function DynamoDBCrudTest() {
  const [createItemID, setCreateItemID] = useState('');
  const [createItemData, setCreateItemData] = useState('');
  const [updateItemID, setUpdateItemID] = useState('');
  const [updateItemData, setUpdateItemData] = useState('');
  const [retrieveItemID, setRetrieveItemID] = useState('');
  const [message, setMessage] = useState('');
  const [retrievedItem, setRetrievedItem] = useState(null);

  // Handle creating an item in DynamoDB
  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const data = await createItemInDynamoDB({ ownerId: 'yourOwnerId', id: createItemID, name: createItemData });
      setMessage(`Item created successfully: ${JSON.stringify(data)}`);
      setCreateItemID(''); 
      setCreateItemData(''); 
    } catch (error) {
      setMessage(`Error creating item: ${error.message}`);
    }
  };

  // Handle retrieving an item from DynamoDB
  const handleRetrieveItem = async () => {
    try {
      const data = await retrieveItemFromDynamoDB(retrieveItemID);
      setRetrievedItem(data);
      setMessage('Item retrieved successfully');
      setRetrieveItemID(''); 
    } catch (error) {
      setMessage(`Error retrieving item: ${error.message}`);
    }
  };

  // Handle updating an item in DynamoDB
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const data = await updateItemInDynamoDB(updateItemID, { name: updateItemData });
      setMessage(`Item updated successfully: ${JSON.stringify(data)}`);
      setUpdateItemID(''); 
      setUpdateItemData('');
    } catch (error) {
      setMessage(`Error updating item: ${error.message}`);
    }
  };

  // Handle deleting an item from DynamoDB
  const handleDeleteItem = async () => {
    try {
      const data = await deleteItemFromDynamoDB(itemID);
      setMessage('Item deleted successfully');
      setDeleteItemID(''); 
    } catch (error) {
      setMessage(`Error deleting item: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>DynamoDB CRUD Test Page</h1>
      <p>{message}</p>

      {/* Create Item */}
      <h3>Create Item</h3>
      <form onSubmit={handleCreateItem}>
        <input
          type="text"
          value={createItemID}
          placeholder="Item ID"
          onChange={(e) => setCreateItemID(e.target.value)}
        />
        <input
          type="text"
          value={createItemData}
          placeholder="Name"
          onChange={(e) => setCreateItemData(e.target.value)}
        />
        <button type="submit">Create Item</button>
      </form>

      {/* Retrieve Item */}
      <h3>Retrieve Item</h3>
      <input
        type="text"
        value={retrieveItemID}
        placeholder="Item ID"
        onChange={(e) => setRetrieveItemID(e.target.value)}
      />
      <button onClick={handleRetrieveItem} disabled={!retrieveItemID}>
        Retrieve Item
      </button>
      {retrievedItem && <p>Retrieved Item: {JSON.stringify(retrievedItem)}</p>}

      {/* Update Item */}
      <h3>Update Item</h3>
      <form onSubmit={handleUpdateItem}>
        <input
          type="text"
          value={updateItemID}
          placeholder="Item ID"
          onChange={(e) => setUpdateItemID(e.target.value)}
        />
        <input
          type="text"
          value={updateItemData}
          placeholder="New Item Data"
          onChange={(e) => setUpdateItemData(e.target.value)}
        />
        <button type="submit" disabled={!updateItemID}>Update Item</button>
      </form>

      {/* Delete Item */}
      <h3>Delete Item</h3>
      <input
        type="text"
        value={deleteItemID}
        placeholder="Item ID"
        onChange={(e) => setDeleteItemID(e.target.value)}
      />
      <button onClick={handleDeleteItem} disabled={!deleteItemID}>Delete Item</button>
    </div>
  );
}
