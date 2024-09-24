const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

export const checkUser = async (sub) => {
  try {
    const response = await fetch(`${BACKEND_URL}api/check-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sub }),  // Pass sub to backend
    });

    if (!response.ok) {
      throw new Error("Failed to check user details.");
    }

    const data = await response.json();
    return data;  // This should return whether fields are present or not
  } catch (error) {
    console.error("Error checking user details:", error);
    return { hasAccountDetails: false };  // Default to false on error
  }
};

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
