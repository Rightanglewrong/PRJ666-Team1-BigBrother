// src/utils/suggestionsAPI.js
const BACKEND_URL = 'https://big-brother-be-3d6ad173758c.herokuapp.com/';

//  Generate activity suggestions for a child based on their progress reports.
export const generateSuggestions = async (childID, childAge) => {
  try {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
    if (!token) {
      throw new Error('Unauthorized - Token not found.');
    }

    const response = await fetch(`${BACKEND_URL}suggestions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ childID, childAge }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate suggestions.');
    }

    const data = await response.json();
    return data; // Return the suggestions data
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw new Error(error.message);
  }
};
