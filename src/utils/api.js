const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

export async function updateUserProfile(updatedData) {
  const token = localStorage.getItem("token"); // Retrieve token from localStorage

  const response = await fetch(`${BACKEND_URL}auth/update`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`, // Pass JWT token for authentication
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData), // Send updated user data
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }

  return await response.json(); // Return the success message or updated data
}

// Get the current user's details using the token
export async function getCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Pass JWT in headers
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Please log in again.");
      } else if (response.status === 404) {
        throw new Error("User not found. Please check your account.");
      } else {
        throw new Error(
          "Failed to fetch user details. Please try again later."
        );
      }
    }

    const userData = await response.json();
    return userData; // Return user details from backend
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new Error(error.message);
  }
}

export async function login(email, password) {
  try {
    const response = await fetch(`${BACKEND_URL}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if(response.status === 403) {
      throw new Error("Account has not yet been Approved by daycare admin.")
    }

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    return data; // Should return token or error message
  } catch (error) {
    console.error("Error logging in:", error);
    return { error: error.message };
  }
}

export async function signup(signupData) {
  const response = await fetch(`${BACKEND_URL}auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signupData), // Send user data to backend
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  return await response.json();
}

// Function to determine content type based on file extension
const determineContentType = (key) => {
  const extension = key.split(".").pop().toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "avif":
    case "gif":
      return `image/${extension === "jpg" ? "jpeg" : extension}`;
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream"; // Default fallback
  }
};

// Upload a file to S3 with specified key
export const uploadFileToS3 = async (file, key) => {
  if (!file || !key) {
    throw new Error("File and key are required for upload.");
  }

  const formData = new FormData();
  formData.append("key", key);
  formData.append("file", file);

  const res = await fetch(`${BACKEND_URL}v1/media/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  const data = await res.json();
  return data;
};

// Retrieve a file from S3 by key
export const retrieveFileFromS3 = async (fileKey) => {
  const res = await fetch(`${BACKEND_URL}v1/media/get-file?key=${fileKey}`);

  if (!res.ok) {
    throw new Error("File not found");
  }

  const contentType = determineContentType(fileKey);
  const blobby = await res.blob();
  const fileUrl = URL.createObjectURL(blobby);

  return { fileUrl, contentType };
};

// Update an existing file in S3 by key
export const updateFileInS3 = async (fileKey, newFile) => {
  if (!newFile || !fileKey) {
    throw new Error("File and key are required for update.");
  }

  const formData = new FormData();
  formData.append("file", newFile);
  formData.append("key", fileKey);

  const res = await fetch(`${BACKEND_URL}v1/media/update-file`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File update failed");
  }

  const data = await res.json();
  return data;
};

// Delete a file from S3 by key
export const deleteFileFromS3 = async (fileKey) => {
  const res = await fetch(`${BACKEND_URL}v1/media/delete-file`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: fileKey }),
  });

  if (!res.ok) {
    throw new Error("File deletion failed");
  }

  const data = await res.json();
  return data;
};
