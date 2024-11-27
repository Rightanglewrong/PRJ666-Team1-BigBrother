// src/utils/newsletterAPI.js
const BACKEND_URL =
  "https://big-brother-be-3d6ad173758c.herokuapp.com/v1/newsletter";

export const createNewsletter = async (token, newsletterData) => {
  try {
    const response = await fetch(`${BACKEND_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newsletterData),
    });

    if (!response.ok) {
      if (response.status == 403) {
        let errText = "FORBIDDEN: Unauthorized for current action";
        //console.error(`Failed to create Newsletter: ${errText}`);
        throw new Error(errText);
      }
      if (response.status == 500) {
        let errText = "Server Error during  Newsletter creation";
        //console.error(`Failed to create Newsletter: ${errText}`);
        throw new Error(errText);
      }
    }

    return await response.json();
  } catch (error) {
    //console.error("Error creating newsletter:", error);
    throw error;
  }
};

export const updateNewsletter = async (token, id, updateData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status == 403) {
        let errText = "FORBIDDEN: Unauthorized for current action";
        //console.error(`Failed to update Newsletter: ${errText}`);
        throw new Error(errText);
      }
      if (response.status == 500) {
        let errText = "Server Error during Newsletter updating";
        //console.error(`Failed to update Newsletter: ${errText}`);
        throw new Error(errText);
      }
    }

    return await response.json();
  } catch (error) {
    //console.error("Error updating newsletter:", error);
    throw error;
  }
};

export const getNewsletter = async (token, id) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to retrieve newsletter");
    }

    return await response.json();
  } catch (error) {
    //console.error("Error retrieving newsletter:", error);
    throw error;
  }
};

export const getAllNewsletters = async (token, daycareID) => {
  const response = await fetch(`${BACKEND_URL}/location/${daycareID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // throw new Error("Failed to fetch the all newsletters");
    if (response.status === 404) {
      throw new Error(`${response.status}: No Newsletters currently`);
    } else {
      throw new Error(`Failed to fetch the all newsletters`);
    }
  }

  const data = await response.json();
  return data.newsletters;
};

export const deleteNewsletter = async (token, id) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete newsletter");
    }

    return await response.json();
  } catch (error) {
    //console.error("Error deleting newsletter:", error);
    throw error;
  }
};
