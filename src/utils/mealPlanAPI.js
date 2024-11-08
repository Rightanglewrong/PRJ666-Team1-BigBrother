// src/utils/mealPlanAPI.js
const BACKEND_URL =
  "https://big-brother-be-3d6ad173758c.herokuapp.com/v1/meal-plan";

export const createMealPlan = async (token, mealPlanData) => {
  try {
    const response = await fetch(`${BACKEND_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mealPlanData),
    });
    console.log(response)
    if (!response.ok) {
      if (response.status === 401) {
        // Throw a specific error if the user is not authorized
        throw new Error("Unauthorized - please log in again.");
      }
      if (response.status == 403) {
        let errText = "FORBIDDEN: Unauthorized for current action";
        console.error(`Failed to create mealPlan: ${errText}`);
        throw new Error(errText);
      }
      if (response.status == 500) {
        let errText = "Server Error during mealPlan creation";
        console.error(`Failed to create mealPlan: ${errText}`);
        throw new Error(errText);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating meal plan:", error);
    throw error;
  }
};

export const updateMealPlan = async (token, id, updateData) => {
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
      if (response.status === 401) {
        // Throw a specific error if the user is not authorized
        throw new Error("Unauthorized - please log in again.");
      }
      if (response.status == 403) {
        let errText = "FORBIDDEN: Unauthorized for current action";
        console.error(`Failed to update mealPlan: ${errText}`);
        throw new Error(errText);
      }
      if (response.status == 500) {
        let errText = "Server Error during mealPlan updating";
        console.error(`Failed to update mealPlan: ${errText}`);
        throw new Error(errText);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating meal plan:", error);
    throw error;
  }
};

export const getMealPlan = async (token, id) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Throw a specific error if the user is not authorized
      throw new Error("Unauthorized - please log in again.");
    }

    if (!response.ok) {
      throw new Error("Failed to retrieve meal plan");
    }

    return await response.json();
  } catch (error) {
    console.error("Error retrieving meal plan:", error);
    throw error;
  }
};

export const getLatestMealPlan = async (token, daycareID) => {
  const response = await fetch(`${BACKEND_URL}/latest/${daycareID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // Throw a specific error if the user is not authorized
    throw new Error("Unauthorized - please log in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch the latest meal plan");
  }

  const data = await response.json();
  return data.mealPlan;
};

export const deleteMealPlan = async (token, id) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Throw a specific error if the user is not authorized
      throw new Error("Unauthorized - please log in again.");
    }

    if (!response.ok) {
      throw new Error("Failed to delete meal plan");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    throw error;
  }
};
