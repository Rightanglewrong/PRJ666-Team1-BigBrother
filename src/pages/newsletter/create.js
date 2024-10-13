// src/pages/newsletter/create.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createNewsletter } from "../../utils/newsletterAPI";
import { getCurrentUser } from "@/utils/api";

export default function CreateNewsletterPage() {
  const router = useRouter();
  const [newsletter, setNewsletter] = useState({
    title: "",
    content: "",
  });
  const [message, setMessage] = useState("");
  const [userDetails, setUserDetails] = useState({
    locationID: "",
    firstName: "",
    lastName: "",
    accountType: "",
  });
  const [loading, setLoading] = useState(true);

  // Get the user details on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User is not authenticated");
      return router.push("/login");
    }

    async function fetchUserProfile() {
      try {
        const userDetails = await getCurrentUser();
        setUserDetails({
          locationID: userDetails.locationID,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          accountType: userDetails.accountType,
        });
        setLoading(false);
      } catch (error) {
        setMessage("Error fetching user details");
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsletter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Validates account role again b4 proceeding
    if (
      userDetails.accountType !== "Admin" &&
      userDetails.accountType !== "Staff"
    ) {
      setMessage("User is not authorized to create a newsletter");
      return;
    }

    // Include locationID(daycareID) and publishedBy in the newsletter object
    const locationID = userDetails.locationID;
    const fName = userDetails.firstName;
    const lName = userDetails.lastName;
    const publishedBy = `${fName} ${lName}`;
    const newsletterData = { ...newsletter, locationID, publishedBy };

    try {
      const result = await createNewsletter(token, newsletterData);
      console.log(result);
      setMessage("Newsletter created successfully");
      setTimeout(() => {
        router.push("/newsletter");
      }, 500);
    } catch (error) {
      if (error.message.includes("403")) {
        setMessage("You do not have permission to create a newsletter.");
      } else {
        setMessage("An error occurred while creating the newsletter");
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Show loading state while fetching user details
  }

  return (
    <div>
      <h1>Create Newsletter</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Create Newsletter</button>
      </form>

      {/* Back button to return to the main newsletter list */}
      <button onClick={() => router.push("/newsletter")}>
        Back to Newsletter List
      </button>
    </div>
  );
}
