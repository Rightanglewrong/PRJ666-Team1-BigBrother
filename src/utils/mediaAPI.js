const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

// API call to fetch media by location ID
export const fetchMediaByLocationID = async (locationID) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}v1/media/by-location/${locationID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching media by location: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.mediaEntries; // mediaEntries now contains metadata including mediaID
  } catch (error) {
    //console.error("Error fetching media by location ID:", error);
    throw error;
  }
};


export const fetchPaginatedMedia = async (mediaEntries, page) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}v1/media/paginated-media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mediaEntries,
        page,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching paginated media: ${response.statusText}`);
    }

    const data = await response.json();
    return data.mediaFiles.map((file) => ({
      mediaID: file.mediaID,
      LastModified: file.LastModified,
      Size: file.Size,
      url: file.FileData || file.presignedUrl,
      uploadedBy: file.uploadedBy,
      locationID: file.locationID,
      childID: file.childID,
      description: file.description || ''
    }));
  } catch (error) {
    //console.error("Error fetching paginated media:", error);
    throw error;
  }
};

// Main function to handle both calls in sequence
export const getPaginatedMediaByLocation = async (locationID, page) => {
  try {
    // Step 1: Fetch all media entries by location ID
    const mediaEntries = await fetchMediaByLocationID(locationID);

    // Step 2: Fetch paginated media with pre-signed URLs based on the entries and page number
    const paginatedMedia = await fetchPaginatedMedia(mediaEntries, page);

    return paginatedMedia;
  } catch (error) {
    //console.error("Error fetching paginated media by location:", error);
    throw error;
  }
};

// For Deleting media in dynamoDB and s3
export const deleteMediaByMediaID = async (mediaID, s3Key) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    //console.log("Sending delete request for mediaID:", mediaID, "and s3Key:", s3Key); // Debugging line
    const response = await fetch(`${BACKEND_URL}v1/media/delete/${mediaID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ s3Key }), // Send s3Key in the request body
    });

    if (!response.ok) {
      const errorData = await response.json();
      //console.error(`Error deleting media: ${response.statusText}`, errorData);
      throw new Error(`Error deleting media: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    //console.error("Error deleting media by mediaID:", error);
    throw error;
  }
};


// Upload a media file along with metadata to S3 and DynamoDB
export const uploadMedia = async (file, childID, description = "") => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  if (!file || !childID) {
    throw new Error("File and childID are required");
  }

  if (description && description.length > 150) {
    throw new Error("Description must be 150 characters or fewer.");
  }
  //console.log(description);

  try {
    const formData = new FormData();
    formData.append("file", file); // Attach the file
    formData.append("childID", childID); // Attach the childID as metadata

    if(description){
    formData.append("description", description); // Attach the childID as metadata
    }
    

    const response = await fetch(`${BACKEND_URL}v1/media/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      //console.error("Error uploading media:", errorData);
      throw new Error("Failed to upload media");
    }

    const data = await response.json();
    return data.media; // Return the newly created media entry
  } catch (error) {
    //console.error("Error uploading media:", error);
    throw error;
  }
};

// API call to fetch media by user ID
export const fetchMediaByUserID = async (userID) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}v1/media/by-userID/${userID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching media by user ID: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.mediaEntries; // mediaEntries now contains metadata including mediaID
  } catch (error) {
    //console.error("Error fetching media by user ID:", error);
    throw error;
  }
};

