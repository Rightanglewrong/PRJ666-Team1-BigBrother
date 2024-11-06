// src/utils/activityLogAPI

const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

// Fetch activity logs by location ID and date range
export const fetchLogsByLocation = async (
  locationID,
  startDate,
  endDate,
  limit = 10
) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}log/by-location?locationID=${locationID}&startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 404) {
      return []; // No logs found for specified criteria
    }

    if (!response.ok) {
      throw new Error(
        "Error fetching activity logs by location and date range"
      );
    }

    const data = await response.json();
    return data.logs || [];
  } catch (error) {
    console.error("Error fetching logs by location:", error);
    throw new Error(error.message);
  }
};

// Fetch activity logs by user email
export const fetchLogsByUser = async (
  userEmail,
  startDate,
  endDate,
  limit = 10
) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}log/by-user?userEmail=${userEmail}&startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 404) {
      return []; // No logs found for specified criteria
    }

    if (!response.ok) {
      throw new Error(
        "Error fetching activity logs by user email and date range"
      );
    }

    const data = await response.json();
    return data.logs || [];
  } catch (error) {
    console.error("Error fetching logs by user:", error);
    throw new Error(error.message);
  }
};

// Delete an activity log by location ID and timestamp
export const deleteActivityLog = async (locationID, timestamp) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}log`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locationID, timestamp }),
    });

    if (response.status === 404) {
      throw new Error("Activity log not found");
    }

    if (!response.ok) {
      throw new Error("Error deleting activity log");
    }

    const data = await response.json();
    return { message: "Activity log deleted successfully", data };
  } catch (error) {
    console.error("Error deleting activity log:", error);
    throw new Error(error.message);
  }
};
