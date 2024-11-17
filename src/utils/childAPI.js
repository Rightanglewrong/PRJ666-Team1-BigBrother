const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

// Create a new child profile
export const createChildProfileInDynamoDB = async (childData) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}v1/child`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(childData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error("Error creating Child Profile in DynamoDB");
    }

    const data = await response.json();
    return { message: "Child Profile created successfully", child: data };
  } catch (error) {
    console.error("Error creating Child Profile:", error);
    throw new Error(error.message);
  }
};

// Retrieve a child profile by childID
export const retrieveChildProfileByID = async (childID) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}v1/child/by-ID/${childID}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Child Profile not found");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error retrieving Child Profile:", error);
    throw new Error(error.message);
  }
};

// Update a child profile by childID
export const updateChildProfileInDynamoDB = async (childID, updateData) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}v1/child/${childID}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Error updating Child Profile in DynamoDB: ${errorDetails}`);
    }

    const data = await response.json();
    return { message: "Child Profile updated successfully", child: data };
  } catch (error) {
    console.error("Error updating Child Profile:", error);
    throw new Error(error.message);
  }
};

// Delete a child profile by childID
export const deleteChildProfileFromDynamoDB = async (childID) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}v1/child/${childID}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Error deleting Child Profile in DynamoDB: ${errorDetails}`);
    }

    const data = await response.json();
    return { message: "Child Profile deleted successfully", data };
  } catch (error) {
    console.error("Error deleting Child Profile:", error);
    throw new Error(error.message);
  }
};

// Get children by classID
export const retrieveChildrenByClassID = async (classID) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}v1/child/class?classID=${classID}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error("No Children found for the specified Class ID");
    }

    const data = await response.json();
    return data.entries;
  } catch (error) {
    console.error("Error retrieving Children by Class ID:", error);
    throw new Error(error.message);
  }
};

// Get children by locationID
export const retrieveChildrenByLocationID = async (locationID) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}v1/child/location?locationID=${locationID}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error("No Children found for the specified Location ID");
    }

    const data = await response.json();
    return data.entries;
  } catch (error) {
    console.error("Error retrieving Children by Location ID");
    throw new Error(error.message);
  }
};
