import { useState } from 'react';
import {
  createItemInDynamoDB,
  retrieveItemFromDynamoDB,
  updateItemInDynamoDB,
  deleteItemFromDynamoDB,
} from '../utils/dynamoAPI'; 

export default function DynamoDBCrudTest() {
  const [itemID, setItemID] = useState('');
  const [itemData, setItemData] = useState('');
  const [message, setMessage] = useState('');
  const [retrievedItem, setRetrievedItem] = useState(null);

  // Handle creating an item in DynamoDB
  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const data = await createItemInDynamoDB({ itemID, itemData });
      setMessage(`Item created successfully: ${JSON.stringify(data)}`);
    } catch (error) {
      setMessage(`Error creating item: ${error.message}`);
    }
  };

  // Handle retrieving an item from DynamoDB
  const handleRetrieveItem = async () => {
    try {
      const data = await retrieveItemFromDynamoDB(itemID);
      setRetrievedItem(data);
      setMessage('Item retrieved successfully');
    } catch (error) {
      setMessage(`Error retrieving item: ${error.message}`);
    }
  };

  // Handle updating an item in DynamoDB
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const data = await updateItemInDynamoDB(itemID, { itemData });
      setMessage(`Item updated successfully: ${JSON.stringify(data)}`);
    } catch (error) {
      setMessage(`Error updating item: ${error.message}`);
    }
  };

  // Handle deleting an item from DynamoDB
  const handleDeleteItem = async () => {
    try {
      const data = await deleteItemFromDynamoDB(itemID);
      setMessage('Item deleted successfully');
      setItemID(''); // Clear the item ID after deletion
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
          value={itemID}
          placeholder="Item ID"
          onChange={(e) => setItemID(e.target.value)}
        />
        <input
          type="text"
          value={itemData}
          placeholder="Item Data"
          onChange={(e) => setItemData(e.target.value)}
        />
        <button type="submit">Create Item</button>
      </form>

      {/* Retrieve Item */}
      <h3>Retrieve Item</h3>
      <input
        type="text"
        value={itemID}
        placeholder="Item ID"
        onChange={(e) => setItemID(e.target.value)}
      />
      <button onClick={handleRetrieveItem} disabled={!itemID}>
        Retrieve Item
      </button>
      {retrievedItem && <p>Retrieved Item: {JSON.stringify(retrievedItem)}</p>}

      {/* Update Item */}
      <h3>Update Item</h3>
      <form onSubmit={handleUpdateItem}>
        <input
          type="text"
          value={itemID}
          placeholder="Item ID"
          onChange={(e) => setItemID(e.target.value)}
        />
        <input
          type="text"
          value={itemData}
          placeholder="New Item Data"
          onChange={(e) => setItemData(e.target.value)}
        />
        <button type="submit" disabled={!itemID}>Update Item</button>
      </form>

      {/* Delete Item */}
      <h3>Delete Item</h3>
      <input
        type="text"
        value={itemID}
        placeholder="Item ID"
        onChange={(e) => setItemID(e.target.value)}
      />
      <button onClick={handleDeleteItem} disabled={!itemID}>Delete Item</button>
    </div>
  );
}
