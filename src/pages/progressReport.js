import { useState, useEffect } from "react";
import {
  retrieveProgressReportByChildID,
} from "../utils/progressReportAPI";
import { retrieveChildProfileByID, retrieveChildrenByLocationID } from "../utils/childAPI";
import { getRelationshipByParentID } from "../utils/relationshipAPI";
import { getCurrentUser } from "../utils/api";
import styles from "./progressReport.module.css";

export default function ProgressReport() {
  const [childID, setChildID] = useState("");
  const [message, setMessage] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [userId, setUserId] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChildID, setSelectedChildID] = useState(null);
  const [filteredReports, setFilteredReports] = useState([]);
  const [currentChildProfile, setCurrentChildProfile] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getCurrentUser();
        setUserDetails(userData);
        if (userData) {
          setUserId(userData.userID);
          if (userData.accountType === 'Parent') {
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
      const childData = await retrieveChildProfileByID(childID);
      setCurrentChildProfile(childData.child.child);
    } catch (error) {
      setMessage(`Error fetching child profile: ${error.message}`);
    }

    try {
      const reports = await retrieveProgressReportByChildID(childID);
      setFilteredReports(reports);
    } catch (error) {
      setMessage(`Error fetching progress reports: ${error.message}`);
    }
  };

  const handleReportClick = (report) => {
    setSelectedReport(report); // Set selected report details
  };

  const parseReportContent = (content) => {
    if (content && typeof content === 'string') {
      const contentArray = content.split('|').map(item => item.trim());
      const [subject, progressTrend, comments, action] = contentArray;

      return (
        <div>
          {subject && <div><strong>Subject:</strong> {subject}</div>}
          {progressTrend && <div><strong>Progress Trend:</strong> {progressTrend}</div>}
          {comments && <div><strong>Comments:</strong> {comments}</div>}
          {action && <div><strong>Action:</strong> {action}</div>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.h1Style}>Progress Reports</h1>
        <p className={styles.message}>{message}</p>

        <div className={styles.reportsSection}>
          {selectedChildID ? (
            <div>
              <div className={styles.selectedChildHeader}>
                <h3>Progress Reports for {currentChildProfile.firstName} {currentChildProfile.lastName}</h3>
              </div>
              <div className={styles.reportCardContainer}>
                {filteredReports.map((report) => (
                  <div
                    key={report.progressReportID}
                    className={styles.reportCard}
                    onClick={(e) => handleReportClick(report)}
                  >
                    <strong>{report.reportTitle}</strong>
                    <p>{parseReportContent(report.content)}</p>
                    <p><em>Created by: {report.createdBy}</em> on {report.datePosted}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleReset} className={styles.resetButton}>
                Return to Child Profiles
              </button>
            </div>
          ) : (
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
          )}
        </div>

        {/* Show selected report details in a modal or separate section */}
        {selectedReport && (
          <div className={styles.reportDetailModal}>
            <div className={styles.reportDetailContainer}>
              <h2>{selectedReport.reportTitle}</h2>
              <p>{selectedReport.content}</p>
              <p><em>Created by: {selectedReport.createdBy}</em> on {selectedReport.datePosted}</p>
              <button onClick={() => setSelectedReport(null)} className={styles.closeButton}>
                Close
              </button>
            </div>
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
    </div>
  );
}
