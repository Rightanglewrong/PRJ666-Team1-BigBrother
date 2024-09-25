const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

export async function updateUserProfile(updatedData) {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  const response = await fetch(`${BACKEND_URL}update`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`, // Pass JWT token for authentication
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedData) // Send updated user data
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return await response.json(); // Return the success message or updated data
}

// Get the current user's details using the token
export async function getCurrentUser() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Pass JWT in headers
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }

    const userData = await response.json();
    return userData;  // Return user details from backend
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error(error.message);
  }
}

export async function login(email, password) {
  try {
    const response = await fetch(`${BACKEND_URL}login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    return data;  // Should return token or error message
  } catch (error) {
    console.error('Error logging in:', error);
    return { error: error.message };
  }
}

export async function signup(signupData) {
  const response = await fetch(`${BACKEND_URL}register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signupData),  // Send user data to backend
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return await response.json();
}




const determineContentType = (key) => {
  const extension = key.split('.').pop().toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'avif':
    case 'gif':
      return `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream'; // Default fallback
  }
};

// Sends call to backend API w/ file to upload
export const uploadFileToS3 = async (file) => {
  if (!file) {
    throw new Error("No file selected");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BACKEND_URL}v1/test/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  const data = await res.json();
  return data;
};

// To GET from s3
export const retrieveFileFromS3 = async (fileKey) => {
  const res = await fetch(`${BACKEND_URL}v1/test/get-file?key=${fileKey}`);

  if (!res.ok) {
    throw new Error("File not found");
  }
  // Infer the content type from the file key
  const contentType = determineContentType(fileKey);
  const blobby = await res.blob();
  const fileUrl = URL.createObjectURL(blobby); // Create URL from blob

  return { fileUrl, contentType };
};

// To update in s3
export const updateFileInS3 = async (fileKey, newFile) => {
  if (!newFile) {
    throw new Error("No file selected for update");
  }

  const formData = new FormData();
  formData.append("file", newFile);
  formData.append("key", fileKey);

  const res = await fetch(`${BACKEND_URL}v1/test/update-file`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File update failed");
  }

  const data = await res.json();
  return data;
};

// To DELETE from S3
export const deleteFileFromS3 = async (fileKey) => {
  const res = await fetch(`${BACKEND_URL}v1/test/delete-file`, {
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
