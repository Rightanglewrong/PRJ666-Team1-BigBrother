// src/pages/newsletter/[id].js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  getNewsletter,
  updateNewsletter,
  deleteNewsletter,
} from "@/utils/newsletterAPI";
import { getCurrentUser } from "@/utils/api";

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
