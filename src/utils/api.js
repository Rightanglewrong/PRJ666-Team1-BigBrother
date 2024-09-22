export const checkUser = async (sub) => {
  try {
    const response = await fetch('https://big-brother-be-3d6ad173758c.herokuapp.com/api/check-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sub }),
    });

    if (!response.ok) {
      throw new Error('Failed to check user details.');
    }

    const data = await response.json();
    return data;  // This should return the response whether fields are present or not
  } catch (error) {
    console.error('Error checking user details:', error);
    return { hasAccountDetails: false };  // Default to false on error
  }
};

