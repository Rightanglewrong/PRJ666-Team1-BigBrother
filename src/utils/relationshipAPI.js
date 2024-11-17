const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

// Create an Relationship in DynamoDB
export const createRelationshipInDynamoDB = async (item) => {

  const token = localStorage.getItem('token');

      if (!token) {
          throw new Error("No token found");
      }

  try {
    const response = await fetch(`${BACKEND_URL}v1/relationship`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorText = await response.text(); 
            console.error("Error response:", errorText);
      throw new Error("Error creating Relationship in DynamoDB");
    }

    const data = await response.json();
    return { message: "Relationship created successfully", item: data };
  } catch (error) {
    console.error("Error creating Relationship:", error);
    throw new Error(error.message);
  }
};

// Get a Relationship from DynamoDB
export const getRelationshipFromDynamoDB = async (item) => {
  const token = localStorage.getItem('token');

  if (!token) {
      throw new Error("No token found");
  }

  try {
      const response = await fetch(`${BACKEND_URL}v1/relationship/by-ID/${item.id}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Relationship not found");
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Error retrieving Relationship:", error);
    throw new Error(error.message);
  }
};

// Update an Relationship in DynamoDB
export const updateRelationshipInDynamoDB = async (id, updateData) => {
  const token = localStorage.getItem('token');

  if (!token) {
      throw new Error("No token found");
  }

  try {
    const response = await fetch(`${BACKEND_URL}v1/relationship/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        const errorDetails = await response.text(); 
        throw new Error(`Error updating Relationship in DynamoDB: ${errorDetails}`);
    }

    const data = await response.json();
    return { message: "Relationship updated successfully", item: data };
  } catch (error) {
    console.error("Error updating Relationship:", error);
    throw new Error(error.message);
  }
};

// Delete an Relationship from DynamoDB
export const deleteRelationshipFromDynamoDB = async (id) => {
  const token = localStorage.getItem('token');

  if (!token) {
      throw new Error("No token found");
  }
  try {
    const response = await fetch(`${BACKEND_URL}v1/relationship/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
        const errorDetails = await response.text(); 
        throw new Error(`Error deleting Relationship in DynamoDB: ${errorDetails}`);
    }

    const data = await response.json();
    return { message: "Relationship deleted successfully", data };
  } catch (error) {
    console.error("Error deleting Relationship:", error);
    throw new Error(error.message);
  }

  
};

export const getRelationshipByChildID = async (childID) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error("No token found");
    }
    try {
      
      const response = await fetch(`${BACKEND_URL}v1/relationship/child?childID=${childID}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text(); 
        console.error("Error response:", errorText); 
        throw new Error("No Relationships found for the Child ID");
      }
  
      const data = await response.json();
      return data.entries; 
    } catch (error) {
      console.error("Error retrieving Relationships for the Child ID:", error);
      throw new Error(error.message);
    }
};

export const getRelationshipByParentID = async (parentID) => {
  const token = localStorage.getItem('token');

  if (!token) {
      throw new Error("No token found");
  }
  try {
    
    const response = await fetch(`${BACKEND_URL}v1/relationship/parent?parentID=${parentID}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text(); 
      console.error("Error response:", errorText); 
      throw new Error(errorText || "No Relationships found for the Parent ID");
    }

    const data = await response.json();
    return data.entries; 
  } catch (error) {
    console.error("Error retrieving Relationships for the Location ID:", error);
    throw new Error(error.message);
  }
};
