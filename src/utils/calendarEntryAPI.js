const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

// Create an item in DynamoDB
export const createCalendarEntryInDynamoDB = async (item) => {
    try {
        const response = await fetch(`${BACKEND_URL}v1/calendar-entry`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
        });

        if (!response.ok) {
            throw new Error("Error creating Calendar Entry in DynamoDB");
        }

        const data = await response.json();
        return { message: "Calendar Entry created successfully", item: data };
    } catch (error) {
        console.error("Error creating Calendar Entry:", error);
        throw new Error(error.message);
    }
};

// Retrieve an item from DynamoDB
export const retrieveCalendarEntryFromDynamoDB = async (item) => {
    try {
        const response = await fetch(`${BACKEND_URL}v1/calendar-entry/${item.id}`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Calendar Entry not found");
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Error retrieving Calendar Entry:", error);
        throw new Error(error.message);
    }
};

// Update an item in DynamoDB
export const updateCalendarEntryInDynamoDB = async (item) => {
  try {
    const response = await fetch(`${BACKEND_URL}v1/calendar-entry/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error(`Error updating Calendar Entry in DynamoDB: ${errorDetails}`);
    }

    const data = await response.json();
    return { message: "Calendar Entry updated successfully", item: data };
  } catch (error) {
    console.error("Error updating Calendar Entry:", error);
    throw new Error(error.message);
  }
};

// Delete an item from DynamoDB
export const deleteCalendarEntryFromDynamoDB = async (item) => {
  try {
    const response = await fetch(`${BACKEND_URL}v1/calendar-entry/${item.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error deleting Calendar Entry from DynamoDB");
    }

    const data = await response.json();
    return { message: "Calendar Entry deleted successfully", data };
  } catch (error) {
    console.error("Error deleting Calendar Entry:", error);
    throw new Error(error.message);
  }  
};

export const retrieveCalendarEntriesByDate = async (startDate, endDate) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error("No token found");
    }
    try {
        const response = await fetch(`${BACKEND_URL}v1/calendar-entry/by-date?dateStart=${startDate}&dateEnd=${endDate}`, {
            method: "GET", 
            headers: {
              'Authorization': `Bearer ${token}`, 
            }
        });
  
      if (!response.ok) {
        throw new Error("No calendar entries found for this specified date range");
      }
  
      const data = await response.json();
      return data.entries; 
    } catch (error) {
      console.error("Error retrieving calendar entries by date:", error);
      throw new Error(error.message);
    }
};
