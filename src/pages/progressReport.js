import { useState, useEffect } from 'react';
import {
  createProgressReportInDynamoDB,
  retrieveProgressReportFromDynamoDB,
  updateProgressReportInDynamoDB,
  deleteProgressReportFromDynamoDB,
  retrieveProgressReportByChildID,
} from '../utils/progressReportAPI'; 
import { getCurrentUser } from '../utils/api'; // Importing the function to get current user

export default function ProgressReport() {
  const [createReportID, setCreateReportID] = useState('');
  const [createReportTitle, setCreateReportTitle] = useState(''); // New field for report title
  const [createReportContent, setCreateReportContent] = useState('');
  const [updateChildID, setUpdateChildID] = useState('');
  const [updateReportID, setUpdateReportID] = useState('');
  const [updateReportContent, setUpdateReportContent] = useState('');
  const [retrieveReportID, setRetrieveReportID] = useState('');
  const [retrievedReport, setRetrievedReport] = useState(null);
  const [deleteReportID, setDeleteReportID] = useState(''); 
  const [message, setMessage] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [userId, setUserId] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [childID, setChildID] = useState(''); 
  const [filteredReports, setFilteredReports] = useState([]);

  // useEffect for fetching user details and setting userId and authorization
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getCurrentUser();
        setUserDetails(userData);
        if (userData) {
          setUserId(userData.userID); // Set the current user's ID
          if (userData.accountType === 'Admin' || userData.accountType === 'Staff') {
            setIsAuthorized(true); // Set authorization based on account type
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user details. Please log in again.');
      }
    };

    fetchUserDetails();
  }, []);

  
  // Handle creating a Progress Report in DynamoDB
  const handleCreateReport = async (e) => {
    
    e.preventDefault();
    if (!isAuthorized) {
        setErrorMessage('Unauthorized: Only admin or staff can create Progress Reports.');
        setShowErrorModal(true);
        return;
    }
      
    
    try {
      const newReport = {
        childID: createReportID,
        reportTitle: createReportTitle,
        content: createReportContent,
        createdBy: userId, 
      };

      const data = await createProgressReportInDynamoDB(newReport);
      setMessage(`Progress Report created successfully: ${JSON.stringify(data.item)}`);
      setCreateReportID('');
      setCreateReportTitle(''); // Clear title input
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
    if (!isAuthorized) {
        setErrorMessage('Unauthorized: Only admin or staff can update Progress Reports.');
        setShowErrorModal(true);
        return;
    }
 
    try {
      const updateData = {
        id: updateReportID,
        content: updateReportContent,
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
    if (!isAuthorized) {
        setErrorMessage('Unauthorized: Only admin or staff can delete Progress Reports.');
        setShowErrorModal(true);
        return;
    }
  
    try {
      const data = await deleteProgressReportFromDynamoDB({ id: deleteReportID });
      setMessage('Progress Report deleted successfully');
      setDeleteReportID('');
    } catch (error) {
      setMessage(`Error deleting Progress Report: ${error.message}`);
    }
  };

   // Handle filtering progress reports by child ID
   const handleFilterByChildID = async (e) => {
    e.preventDefault();
    try {
      const reports = await retrieveProgressReportByChildID(childID);
      setFilteredReports(reports);
      setMessage(`Found ${reports.length} progress reports for child ID: ${childID}`);
    } catch (error) {
      setMessage(`Error fetching progress reports: ${error.message}`);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
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
          placeholder="Child ID"
          onChange={(e) => setCreateReportID(e.target.value)}
        />
        <input
          type="text"
          value={createReportTitle}
          placeholder="Report Title"
          onChange={(e) => setCreateReportTitle(e.target.value)}
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
          value={updateChildID}
          placeholder="Report ID"
          onChange={(e) => setUpdateChildID(e.target.value)}
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

        {/* Filter Progress Reports by Child ID */}
        <h3>Filter Progress Reports by Child ID</h3>
      <form onSubmit={handleFilterByChildID}>
        <input
          type="text"
          value={childID}
          placeholder="Child ID"
          onChange={(e) => setChildID(e.target.value)}
        />
        <button type="submit">Filter Reports</button>
      </form>

      {filteredReports.length > 0 && (
        <div>
          <h4>Filtered Progress Reports</h4>
          <ul>
            {filteredReports.map((report) => (
              <li key={report.progressReportID}>
                <strong>{report.reportTitle}</strong>: {report.content} (Created by: {report.createdBy})
              </li>
            ))}
          </ul>
        </div>
      )}

      {showErrorModal && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <h3>Error</h3>
                        <p>{errorMessage}</p>
                        <div className={styles.modalButtons}>
                            <button onClick={handleCloseErrorModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
}
