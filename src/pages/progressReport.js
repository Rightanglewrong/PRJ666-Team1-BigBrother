import { useState, useEffect } from "react";
import {
  createProgressReportInDynamoDB,
  updateProgressReportInDynamoDB,
  deleteProgressReportFromDynamoDB,
  retrieveProgressReportByChildID,
} from "../utils/progressReportAPI";
import {retrieveChildProfileByID, retrieveChildrenByLocationID} from "../utils/childAPI"
import {getRelationshipByParentID} from "../utils/relationshipAPI"
import { getCurrentUser } from "../utils/api"; 
import styles from "./progressReport.module.css";

export default function ProgressReport() {
  const [childID, setChildID] = useState("");
  const [createReportChildID, setCreateReportChildID] = useState("");
  const [createReportTitle, setCreateReportTitle] = useState(""); // New field for report title
  const [createReportContent, setCreateReportContent] = useState("");
  const [updateReportID, setUpdateReportID] = useState("");
  const [updateReportTitle, setUpdateReportTitle] = useState("");
  const [updateReportContent, setUpdateReportContent] = useState("");
  const [deleteReportID, setDeleteReportID] = useState("");
  const [message, setMessage] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [userId, setUserId] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChildID, setSelectedChildID] = useState(null);
  const [filteredReports, setFilteredReports] = useState([]);


  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getCurrentUser();
        setUserDetails(userData);
        if (userData) {
          setUserId(userData.userID);
          if (userData.accountType === 'Admin' || userData.accountType === 'Staff') {
            setIsAuthorized(true); 
            const childrenProfiles = await retrieveChildrenByLocationID(userData.locationID);
            const uniqueChildIDs = [...new Set(childrenProfiles.map((child) => child.childID))];
            const childProfilesData = await fetchChildProfiles(uniqueChildIDs);
            setChildProfiles(childProfilesData);
          } else if (userData.accountType === 'Parent') {
            const relationshipData = await getRelationshipByParentID(userData.userID);
            const uniqueChildIDs = [...new Set(relationshipData.map((relationship) => relationship.childID))];
            const childProfilesData = await fetchChildProfiles(uniqueChildIDs);
            setChildProfiles(childProfilesData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Failed to load user details. Please log in again.");
      }
    };
    fetchUserDetails();
  }, []);

  // Handle creating a Progress Report in DynamoDB
  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMessage(
        "Unauthorized: Only admin or staff can create Progress Reports."
      );
      setShowErrorModal(true);
      return;
    }

    try {
      const newReport = {
        childID: createReportChildID,
        reportTitle: createReportTitle,
        content: createReportContent,
        createdBy: userId,
      };

      const data = await createProgressReportInDynamoDB(newReport);
      setMessage(`Progress Report created successfully: ${JSON.stringify(data.item)}`);
      setCreateReportChildID('');
      setCreateReportTitle(''); 
      setCreateReportContent('');
    } catch (error) {
      setMessage(`Error creating Progress Report: ${error.message}`);
    }
  };

  // Handle updating a Progress Report in DynamoDB
  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMessage(
        "Unauthorized: Only admin or staff can update Progress Reports."
      );
      setShowErrorModal(true);
      return;
    }

    try {
      const updateData = {
        reportTitle: updateReportTitle,
        content: updateReportContent,
      };

      const data = await updateProgressReportInDynamoDB(
        updateReportID,
        updateData
      );
      setMessage(
        `Progress Report updated successfully: ${JSON.stringify(data.item)}`
      );
      setUpdateReportID("");
      setUpdateReportContent("");
    } catch (error) {
      setMessage(`Error updating Progress Report: ${error.message}`);
    }
  };

  // Handle deleting a Progress Report from DynamoDB
  const handleDeleteReport = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMessage(
        "Unauthorized: Only admin or staff can delete Progress Reports."
      );
      setShowErrorModal(true);
      return;
    }

    try {
      const data = await deleteProgressReportFromDynamoDB({
        id: deleteReportID,
      });
      setMessage("Progress Report deleted successfully");
      setDeleteReportID("");
    } catch (error) {
      setMessage(`Error deleting Progress Report: ${error.message}`);
    }
  };

  const fetchChildProfiles = async (uniqueChildIDs) => {
    try {
      const childProfileData = await Promise.all(
        uniqueChildIDs.map(async (id) => {
          try {
            const childData = await retrieveChildProfileByID(id);
            if (!childData) {
              console.warn(`No data found for child with ID ${id}`);
              return null; 
            }
            const { childID, firstName, lastName, age, birthDate, ...rest } = childData.child.child;
            return {
              childID,
              firstName,
              lastName,
              age,
              birthDate,
            };
          } catch (error) {
            console.error(`Error retrieving data for child ${id}:`, error);
            throw error; 
          }
        })
      );
      console.log(childProfileData);
      const validChildProfiles = childProfileData.filter(profile => profile !== null).flat();
      return validChildProfiles;
            
    } catch (error) {
      console.error("Error fetching child profiles:", error);
      setErrorMessage("Failed to fetch child profiles.");
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleReset = () => {
    setSelectedChildID(null);
    setFilteredReports([]);
    setChildID("");
    setMessage("");
  };

  const handleChildClick = async (childID) => {
    setSelectedChildID(childID);
    setChildID(childID); 

    try {
      const reports = await retrieveProgressReportByChildID(childID);
      setFilteredReports(reports);
      setMessage(`Found ${reports.length} progress reports for child ID: ${childID}`);
    } catch (error) {
      setMessage(`Error fetching progress reports: ${error.message}`);
    }
  };

  const handleReportClick = (report) => {
    setUpdateReportID(report.progressReportID);
    setUpdateReportTitle(report.reportTitle);
    setUpdateReportContent(report.content);
    setDeleteReportID(report.progressReportID);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.h1Style}>Progress Reports</h1>
        <p className={styles.message}>{message}</p>

        {isAuthorized ? (
          <> {!selectedChildID ? (
            <div>
            <h3>All Children by Location</h3>
            <div className={styles.profileContainer}>
            {childProfiles.map((child) => (
                    <div key={child.childID} className={styles.profileCard}>
                        <h4>{child.firstName} {child.lastName}</h4>
                        <p><strong>Age:</strong> {child.age}</p>
                        <p><strong>Birth Date:</strong> {child.birthDate}</p>

                        <button
                          className={styles.viewReportsButton}
                          onClick={(e) => {
                            e.preventDefault();
                            handleChildClick(child.childID);
                          }}
                        >
                          View Progress Reports
                        </button>
                     </div>
                  ))}
            </div>
          </div>
          ) : (

            <div className={styles.reportsSection}>
            <h3>Progress Reports for Selected Child</h3>
            <div className={styles.reportCardContainer}>
              {filteredReports.map((report) => (
                <div key={report.progressReportID}>
                  <strong>{report.reportTitle}</strong>: {report.content}{" "}
                  (Created by: {report.createdBy})
                </div>
              ))}
            </div>
            <button onClick={handleReset} className={styles.resetButton}>Return to Child Profiles</button>
          </div>
      )};

             {/* Create Progress Report */}
        <h4>Create Progress Report</h4>
        <form onSubmit={handleCreateReport}>
          <input
            type="text"
            value={createReportChildID}
            placeholder="Child ID"
            onChange={(e) => setCreateReportChildID(e.target.value)}
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



        {/* Update Progress Report */}
        <h4>Update Progress Report</h4>
        <form onSubmit={handleUpdateReport}>
          <input
            type="text"
            value={updateReportID}
            placeholder="Report ID"
            onChange={(e) => setUpdateReportID(e.target.value)}
          />
          <input
            type="text"
            value={updateReportTitle}
            placeholder="Report Title"
            onChange={(e) => setUpdateReportTitle(e.target.value)}
          />

          <input
            type="text"
            value={updateReportContent}
            placeholder="New Report Content"
            onChange={(e) => setUpdateReportContent(e.target.value)}
          />
          <button type="submit" disabled={!updateReportID}>
            Update Report
          </button>
        </form>

        {/* Delete Progress Report */}
        <h4>Delete Progress Report</h4>
        <input
          type="text"
          value={deleteReportID}
          placeholder="Report ID"
          onChange={(e) => setDeleteReportID(e.target.value)}
        />
        <button onClick={handleDeleteReport} disabled={!deleteReportID}>
          Delete Report
        </button>
          </>
        ) : (
          <>
            {!selectedChildID ? (
              <div>
                <h3>Select a Child Profile</h3>
                <div className={styles.profileContainer}>
                {childProfiles.map((child) => (
                    <div key={child.childID} className={styles.profileCard}>
                        <h4>{child.firstName} {child.lastName}</h4>
                        <p><strong>Age:</strong> {child.age}</p>
                        <p><strong>Birth Date:</strong> {child.birthDate}</p>

                        <button
                          className={styles.viewReportsButton}
                          onClick={(e) => {
                            e.preventDefault();
                            handleChildClick(child.childID);
                          }}
                        >
                          View Progress Reports
                        </button>
                     </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className={styles.reportsSection}>
                <h3>Progress Reports for Selected Child</h3>
                <div className={styles.reportCardContainer}>
                  {filteredReports.map((report) => (
                    <div key={report.progressReportID}>
                      <strong>{report.reportTitle}</strong>: {report.content}{" "}
                      (Created by: {report.createdBy})
                    </div>
                  ))}
                </div>
                <button onClick={handleReset} className={styles.resetButton}>Return to Child Profiles</button>
              </div>
            </div>
          )};
          </>
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
    </div>
  );
}
