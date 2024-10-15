// src/pages/newsletter/[id].js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  getNewsletter,
  updateNewsletter,
  deleteNewsletter,
} from "@/utils/newsletterAPI";
import { getCurrentUser } from "@/utils/api";
import { sendEmailsToUsers } from "@/utils/emailAPI";

export default function NewsletterDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [newsletter, setNewsletter] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [userDetails, setUserDetails] = useState({
    accountType: "",
    locationID: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState([]);

  // Define account type options
  const accountTypeOptions = ["Admin", "Staff", "Parent"];

  // Fetch newsletter details and user info on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User is not authenticated");
      return router.push("/login");
    }

    async function fetchData() {
      try {
        const userData = await getCurrentUser();
        setUserDetails({
          accountType: userData.accountType,
          firstName: userData.firstName,
          lastName: userData.lastName,
          locationID: userData.locationID,
        });

        if (id) {
          const data = await getNewsletter(token, id);
          setNewsletter(data.newsletter.newsletter);
          setLoading(false);
        }
      } catch (error) {
        setMessage("Error fetching newsletter details");
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  // Handle input change when in edit mode
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsletter((prev) => ({ ...prev, [name]: value }));
  };

  // Handle account type selection
  const handleAccountTypeChange = (e) => {
    const { value, checked } = e.target;
    setSelectedAccountTypes((prevSelected) =>
      checked
        ? [...prevSelected, value]
        : prevSelected.filter((accountType) => accountType !== value)
    );
  };

  // Return to main list of newsletters
  const backToList = () => {
    return router.push("/newsletter");
  };

  // Handle newsletter update
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User is not authenticated");
      return;
    }

    try {
      await updateNewsletter(token, id, {
        title: newsletter.title,
        content: newsletter.content,
      });
      setMessage("Newsletter updated successfully");
      setEditMode(false);
    } catch (error) {
      setMessage("Error updating newsletter");
    }
  };

  // Handle sending the newsletter via email
  const sendNewsletterViaEmail = async () => {
    setSendingEmail(true); // Set email sending state
    const token = localStorage.getItem("token");
    const subject = newsletter.title;
    const content = newsletter.content;

    try {
      // Send emails to the selected account types
      for (const accountType of selectedAccountTypes) {
        console.log(accountType)
        console.log(userDetails.locationID)
        await sendEmailsToUsers(
          token,
          accountType,
          userDetails.locationID,
          subject,
          content
        );
      }
      setMessage("Newsletter emailed successfully to selected users.");
    } catch (error) {
      setMessage("Error sending newsletter via email.");
    } finally {
      setSendingEmail(false); // Reset the email sending state
    }
  };

  const deleteNewsletterBtn = async (e) => {
    const token = localStorage.getItem("token");
    try {
      await deleteNewsletter(token, id);
      setMessage("Deleting now");
      setTimeout(() => {
        router.push("/newsletter");
      }, 500);
    } catch (error) {
      console.log(error);
      setMessage(error);
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Show loading state while fetching user details
  }

  return (
    <div>
      <h1>Newsletter Details</h1>
      {message && <p>{message}</p>}

      {newsletter ? (
        <div>
          {editMode ? (
            <form onSubmit={handleUpdate}>
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={newsletter.title}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <br></br>
              <label>
                Content:
                <textarea
                  name="content"
                  value={newsletter.content}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <br></br>
              <button type="submit">Save Changes</button>
              <br></br>
              <button type="button" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <div>
              <p>
                <strong>Title:</strong> {newsletter.title}
              </p>
              <p>
                <strong>Content:</strong> {newsletter.content}
              </p>
              <p>
                <strong>Published By:</strong> {newsletter.publishedBy}
              </p>
              <p>
                <strong>Created At:</strong> {newsletter.createdAt}
              </p>
              <p>
                <strong>Updated At:</strong> {newsletter.updatedAt}
              </p>

              {/* Show the Edit button only for Admin or Staff */}
              {(userDetails.accountType === "Admin" ||
                userDetails.accountType === "Staff") && (
                <button onClick={() => setEditMode(true)}>
                  Edit Newsletter
                </button>
              )}
              <br></br>
              {userDetails.accountType === "Admin" && (
                <button onClick={() => deleteNewsletterBtn()}>Delete</button>
              )}
              <br></br>
              {/* Account type selection for sending emails */}
              <div>
                <h3>Select Account Types to Email</h3>
                {accountTypeOptions.map((accountType) => (
                  <label key={accountType}>
                    <input
                      type="checkbox"
                      value={accountType}
                      onChange={handleAccountTypeChange}
                    />
                    {accountType}
                  </label>
                ))}
              </div>

              {/* Send Newsletter via Email */}
              {(userDetails.accountType === "Admin" ||
                userDetails.accountType === "Staff") && (
                <>
                  <button
                    onClick={sendNewsletterViaEmail}
                    disabled={sendingEmail || selectedAccountTypes.length === 0}
                  >
                    {sendingEmail ? "Sending..." : "Email Newsletter"}
                  </button>
                  <br />
                </>
              )}
              <br></br>
              <button onClick={() => backToList()}>Back</button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading newsletter...</p>
      )}
    </div>
  );
}
