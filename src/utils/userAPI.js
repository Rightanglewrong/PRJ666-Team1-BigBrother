const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

export const retrieveUserByIDInDynamoDB = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No Token Found");
  }
  try {
    const response = await fetch(`${BACKEND_URL}v1/user/by-ID/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response) {
      throw new Error("User Not Found");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error retreiving User", error);
    throw new Error(error.message);
  }
};

export const updateUserInDynamoDB = async (id, updateData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No Token Found");
  }
  try {
    const response = await fetch(`${BACKEND_URL}v1/user/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Error updating User in DynamoDB: ${errorDetails}`);
    }
    const data = await response.json();
    return { message: "User updated successfully", item: data };
  } catch (error) {
    console.error("Error updating User", error);
    throw new Error(error.message);
  }
};

export const deleteUserInDynamoDB = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No Token Found");
  }
  try {
    const response = await fetch(`${BACKEND_URL}v1/user/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Error deleting User in DynamoDB: ${errorDetails}`);
    }

    const data = await response.json();
    return { message: "User deleted successfully", data };
  } catch (error) {
    console.error("Error Deleting User");
    throw new Error(error.message);
  }
};

export const getUsersByAccountTypeAndLocation = async (
  accountType,
  locationID
) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No Token Found");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}v1/user/location?accountType=${accountType}&locationID=${locationID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Error fetching users: ${errorDetails}`);
    }

    const data = await response.json();
    return data; // Success response with users
  } catch (error) {
    console.error("Error fetching users by accountType and locationID");
    throw new Error(error.message);
  }
};

export async function approveUser(userId) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Unauthorized access. Please log in.");
  }

  const response = await fetch(`${BACKEND_URL}v1/user/approve/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to approve user.");
  }

  const data = await response.json();
  console.log(data)
  return data; 
}
