import { useState } from 'react';
import {
  createProgressReportInDynamoDB,
  retrieveProgressReportFromDynamoDB,
  updateProgressReportInDynamoDB,
  deleteProgressReportFromDynamoDB,
} from '../utils/progressReportAPI'; 

export default function ProgressReportCrudTest() {
  const [createReportID, setCreateReportID] = useState('');
  const [createReportContent, setCreateReportContent] = useState('');
  const [updateReportID, setUpdateReportID] = useState('');
  const [updateReportContent, setUpdateReportContent] = useState('');
  const [retrieveReportID, setRetrieveReportID] = useState('');
  const [retrievedReport, setRetrievedReport] = useState(null);
  const [deleteReportID, setDeleteReportID] = useState(''); 
  const [message, setMessage] = useState('');

  // Handle creating a Progress Report in DynamoDB
  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      const newReport = {
        reportID: createReportID,
        content: createReportContent,
        createdBy: 'currentUserID', // Replace with dynamic user ID retrieval
      };
  
      const data = await createProgressReportInDynamoDB(newReport);
      setMessage(`Progress Report created successfully: ${JSON.stringify(data.item)}`);
      setCreateReportID('');
      setCreateReportContent('');
    } catch (error) {
      setMessage(`Error creating Progress Report: ${error.message}`);
    }
  };

  // Handle retrieving a Progress Report from DynamoDB
  const handleRetrieveReport = async (e) => {
    e.preventDefault();
    try {
      const data = await retrieveProgressReportFromDynamoDB({ id: retrieveReportID });
      setRetrievedReport(data);
      setMessage('Progress Report retrieved successfully');
      setRetrieveReportID('');
    } catch (error) {
      setMessage(`Error retrieving Progress Report: ${error.message}`);
    }
  };

  // Handle updating a Progress Report in DynamoDB
  const handleUpdateReport = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        id: updateReportID,
        content: updateReportContent,
        updatedBy: 'currentUserID', // Replace with dynamic user ID retrieval
      };
  
      const data = await updateProgressReportInDynamoDB(updateData);
      setMessage(`Progress Report updated successfully: ${JSON.stringify(data.item)}`);
      setUpdateReportID('');
      setUpdateReportContent('');
    } catch (error) {
      setMessage(`Error updating Progress Report: ${error.message}`);
    }
  };

  // Handle deleting a Progress Report from DynamoDB
  const handleDeleteReport = async (e) => {
    e.preventDefault();
    try {
      const data = await deleteProgressReportFromDynamoDB({ id: deleteReportID });
      setMessage('Progress Report deleted successfully');
      setDeleteReportID('');
    } catch (error) {
      setMessage(`Error deleting Progress Report: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Progress Report CRUD Test Page</h1>
      <p>{message}</p>

      {/* Create Progress Report */}
      <h3>Create Progress Report</h3>
      <form onSubmit={handleCreateReport}>
        <input
          type="text"
          value={createReportID}
          placeholder="Report ID"
          onChange={(e) => setCreateReportID(e.target.value)}
        />
        <input
          type="text"
          value={createReportContent}
          placeholder="Report Content"
          onChange={(e) => setCreateReportContent(e.target.value)}
        />
        <button type="submit">Create Report</button>
      </form>

      {/* Retrieve Progress Report */}
      <h3>Retrieve Progress Report</h3>
      <input
        type="text"
        value={retrieveReportID}
        placeholder="Report ID"
        onChange={(e) => setRetrieveReportID(e.target.value)}
      />
      <button onClick={handleRetrieveReport} disabled={!retrieveReportID}>
        Retrieve Report
      </button>
      {retrievedReport && <p>Retrieved Report: {JSON.stringify(retrievedReport)}</p>}

      {/* Update Progress Report */}
      <h3>Update Progress Report</h3>
      <form onSubmit={handleUpdateReport}>
        <input
          type="text"
          value={updateReportID}
          placeholder="Report ID"
          onChange={(e) => setUpdateReportID(e.target.value)}
        />
        <input
          type="text"
          value={updateReportContent}
          placeholder="New Report Content"
          onChange={(e) => setUpdateReportContent(e.target.value)}
        />
        <button type="submit" disabled={!updateReportID}>Update Report</button>
      </form>

      {/* Delete Progress Report */}
      <h3>Delete Progress Report</h3>
      <input
        type="text"
        value={deleteReportID}
        placeholder="Report ID"
        onChange={(e) => setDeleteReportID(e.target.value)}
      />
      <button onClick={handleDeleteReport} disabled={!deleteReportID}>
        Delete Report
      </button>
    </div>
  );
}
